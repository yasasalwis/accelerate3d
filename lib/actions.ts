"use server"

import {db} from "./db"
import {revalidatePath} from "next/cache"

// Mock User ID for development until Auth is implemented
const MOCK_USER_ID = "dev-user-001"

async function ensureDevUser() {
    const user = await db.user.upsert({
        where: {id: MOCK_USER_ID},
        update: {},
        create: {
            id: MOCK_USER_ID,
            username: "admin",
            passwordHash: "mock",
        }
    })
    return user.id
}

export async function addPrinterToUser(printerId: string, name: string, ipAddress: string) {
    const userId = await ensureDevUser()

    await db.userPrinter.create({
        data: {
            userId,
            printerId,
            name,
            ipAddress,
        }
    })

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function removePrinterFromUser(userPrinterId: string) {
    await ensureDevUser()

    await db.userPrinter.delete({
        where: {
            id: userPrinterId
        }
    })

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function updateUserPrinter(userPrinterId: string, name: string, ipAddress: string) {
    const userId = await ensureDevUser()

    // Verify ownership
    const existing = await db.userPrinter.findFirst({
        where: {id: userPrinterId, userId}
    })

    if (!existing) {
        throw new Error("Printer not found or access denied")
    }

    await db.userPrinter.update({
        where: {id: userPrinterId},
        data: {name, ipAddress}
    })

    revalidatePath("/printers")
}

export async function getAvailablePrinters() {
    await ensureDevUser() // Just ensuring dev user exists, assuming side effect needed? The variable was unused.
    // Actually, ensureDevUser() creates the user if not exists. It might be needed?
    // The original code was: `const userId = await ensureDevUser()`.
    // Since only userId variable is unused, I should keep the call if it has important side effects (like seeding the db).
    // Yes, it has upsert.
    return db.printer.findMany({
        include: {
            manufacturer: true,
            technology: true,
            features: {
                include: {
                    feature: true
                }
            }
        }
    })
}

export async function schedulePrint(modelId: string, quantity: number) {
    const userId = await ensureDevUser()
    const model = await db.model.findUnique({where: {id: modelId}})
    if (!model) throw new Error("Model not found")

    // 1. Get user printers
    const userPrinters = await db.userPrinter.findMany({
        where: {userId},
        include: {
            printer: true,
            jobs: {where: {status: "PENDING"}}
        }
    })

    if (userPrinters.length === 0) throw new Error("No printers available")

    // 2. Filter compatible printers
    const compatiblePrinters = userPrinters.filter(up => {
        const def = up.printer
        return def.buildVolumeX >= model.widthMm &&
            def.buildVolumeY >= model.depthMm &&
            def.buildVolumeZ >= model.heightMm
    })

    if (compatiblePrinters.length === 0) throw new Error("No compatible printers found for this model's dimensions")

    // 3. Least loaded algorithm
    for (let i = 0; i < quantity; i++) {
        // For simplicity, we'll just pick the one with most IDLE status or fewest pending jobs
        // Refined load balancing:
        const sorted = [...compatiblePrinters].sort((a, b) => a.jobs.length - b.jobs.length)
        const target = sorted[0]

        await db.printJob.create({
            data: {
                userPrinterId: target.id,
                modelId: model.id,
                status: "PENDING"
            }
        })
    }

    revalidatePath("/queue")
}

"use server"

import { db } from "./db"
import { revalidatePath } from "next/cache"

// Mock User ID for development until Auth is implemented
const MOCK_USER_ID = "dev-user-001"

async function ensureDevUser() {
    const user = await db.user.upsert({
        where: { id: MOCK_USER_ID },
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

    await db.userPrinter.upsert({
        where: {
            userId_printerId: {
                userId,
                printerId,
            }
        },
        update: {},
        create: {
            userId,
            printerId,
            name,
            ipAddress,
        }
    })

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function removePrinterFromUser(printerId: string) {
    const userId = await ensureDevUser()

    await db.userPrinter.delete({
        where: {
            userId_printerId: {
                userId,
                printerId,
            }
        }
    })

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function getAvailablePrinters() {
    const userId = await ensureDevUser()
    const userPrinters = await db.userPrinter.findMany({
        where: { userId },
        select: { printerId: true }
    })
    const assignedIds = userPrinters.map(up => up.printerId)

    return db.printer.findMany({
        where: {
            id: { notIn: assignedIds }
        },
        select: {
            id: true,
            manufacturer: {
                select: {
                    name: true
                }
            },
            model: true,
            imageUrl: true,
            technology: {
                select: {
                    name: true
                }
            },
            buildVolumeX: true,
            buildVolumeY: true,
            buildVolumeZ: true,
            priceUsd: true
        }
    })
}

export async function schedulePrint(modelId: string, quantity: number) {
    const userId = await ensureDevUser()
    const model = await db.model.findUnique({ where: { id: modelId } })
    if (!model) throw new Error("Model not found")

    // 1. Get user printers
    const userPrinters = await db.userPrinter.findMany({
        where: { userId },
        include: {
            printer: true,
            jobs: { where: { status: "PENDING" } }
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
        // Calculate load for each compatible printer
        const printerLoads = compatiblePrinters.map(up => {
            const load = up.printer.jobs.reduce((acc, job) => acc + (job.startTime ? 0 : 0), 0) // Basic implementation
            // Actually sum estimated times of pending jobs
            // Need to fetch pending jobs' models
            return { up, load }
        })

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

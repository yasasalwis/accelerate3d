"use server"

import {db} from "./db"
import {revalidatePath} from "next/cache"
import {detectPrinterProtocol, getPrinterStatus} from "./printer-network"

import {getServerSession} from "next-auth"
import {authOptions} from "./auth"

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

async function getAuthenticatedUser(): Promise<string> {
    const session = await getServerSession(authOptions)
    const user = session?.user as SessionUser | undefined
    if (!user?.id) {
        throw new Error("Unauthorized")
    }
    return user.id
}

export async function addPrinterToUser(printerId: string, name: string, ipAddress: string, protocol: string = "AUTO", ejectGcode: string = "") {
    const userId = await getAuthenticatedUser()

    let detectedProtocol = protocol
    if (protocol === "AUTO") {
        detectedProtocol = await detectPrinterProtocol(ipAddress)
    }

    let initialStatus = "OFFLINE"
    if (detectedProtocol !== "UNKNOWN") {
        const statusData = await getPrinterStatus(ipAddress, detectedProtocol)
        initialStatus = statusData.status || "IDLE"
    }

    await db.userPrinter.create({
        data: {
            userId,
            printerId,
            name,
            ipAddress,
            protocol: detectedProtocol,
            status: initialStatus,
            lastSeen: detectedProtocol !== "UNKNOWN" ? new Date() : null,
            webcamUrl: detectedProtocol === "MOONRAKER" ? `http://${ipAddress}/webcam/?action=stream` : null,
            ejectGcode: ejectGcode || null
        }
    })

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function removePrinterFromUser(userPrinterId: string) {
    const userId = await getAuthenticatedUser()

    const result = await db.userPrinter.deleteMany({
        where: {
            id: userPrinterId,
            userId
        }
    })

    if (result.count === 0) {
        throw new Error("Printer not found or access denied")
    }

    revalidatePath("/printers")
    revalidatePath("/")
}

export async function updateUserPrinter(userPrinterId: string, name: string, ipAddress: string, ejectGcode: string = "") {
    const userId = await getAuthenticatedUser()

    // Verify ownership
    const existing = await db.userPrinter.findFirst({
        where: {id: userPrinterId, userId}
    })

    if (!existing) {
        throw new Error("Printer not found or access denied")
    }

    // If IP changed, re-detect protocol
    let protocol = existing.protocol
    let lastSeen = existing.lastSeen
    if (ipAddress !== existing.ipAddress) {
        protocol = await detectPrinterProtocol(ipAddress)
        if (protocol !== "UNKNOWN") lastSeen = new Date()
    }

    await db.userPrinter.update({
        where: {id: userPrinterId},
        data: {name, ipAddress, protocol, lastSeen, ejectGcode: ejectGcode || null}
    })

    revalidatePath("/printers")
}

export async function getAvailablePrinters() {
    await getAuthenticatedUser()
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
    const userId = await getAuthenticatedUser()
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

export async function removePrintJob(printJobId: string) {
    const userId = await getAuthenticatedUser()

    const job = await db.printJob.findUnique({
        where: {id: printJobId},
        include: {userPrinter: true}
    })

    if (!job) {
        throw new Error("Job not found")
    }

    if (job.userPrinter.userId !== userId) {
        throw new Error("Unauthorized")
    }

    await db.printJob.delete({
        where: {id: printJobId}
    })
    revalidatePath("/queue")
}

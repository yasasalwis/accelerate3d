import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const { modelId, userPrinterId, autoQueue, quantity = 1 } = await request.json()

        if (!modelId) {
            return NextResponse.json({ error: "Missing modelId" }, { status: 400 })
        }

        let targetPrinterId = userPrinterId

        if (autoQueue) {
            // Smart Logic: Find the best printer
            // 1. Get all user printers with their current pending job counts
            const printers = await db.userPrinter.findMany({
                include: {
                    _count: {
                        select: { jobs: { where: { status: "PENDING" } } }
                    }
                }
            })

            if (printers.length === 0) {
                return NextResponse.json({ error: "No printers available for auto-queue" }, { status: 400 })
            }

            // 2. Sort by: IDLE status first, then by least pending jobs
            const sortedPrinters = printers.sort((a: any, b: any) => {
                // Priority 1: IDLE status (IDLE is prioritized over anything else)
                if (a.status === "IDLE" && b.status !== "IDLE") return -1
                if (a.status !== "IDLE" && b.status === "IDLE") return 1

                // Priority 2: Least pending jobs
                return a._count.jobs - b._count.jobs
            })

            targetPrinterId = sortedPrinters[0].id
        }

        if (!targetPrinterId) {
            return NextResponse.json({ error: "No printer selected and auto-queue failed to find one" }, { status: 400 })
        }

        // Create multiple jobs based on quantity
        const createdJobs = []
        for (let i = 0; i < quantity; i++) {
            const job = await db.printJob.create({
                data: {
                    modelId,
                    userPrinterId: targetPrinterId,
                    status: "PENDING",
                },
            })
            createdJobs.push(job)
        }

        return NextResponse.json({
            success: true,
            message: `Successfully queued ${quantity} print(s)`,
            count: createdJobs.length,
            jobs: createdJobs
        })
    } catch (error) {
        console.error("Failed to create job", error)
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }
}

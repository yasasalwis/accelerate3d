
import { db } from "@/lib/db"
import { getPrinterStatus } from "@/lib/printer-network"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const printers = await db.userPrinter.findMany()
    const updates = []

    for (const printer of printers) {
        // @ts-ignore
        if (printer.protocol === "UNKNOWN" || !printer.ipAddress) continue

        updates.push((async () => {
            // 1. Fetch live status
            // @ts-ignore
            const statusData = await getPrinterStatus(printer.ipAddress, printer.protocol)

            // 2. Update DB
            const newStatus = statusData.status
            // @ts-ignore
            const lastSeen = newStatus !== "OFFLINE" ? new Date() : printer.lastSeen

            await db.userPrinter.update({
                where: { id: printer.id },
                // @ts-ignore
                data: {
                    status: newStatus,
                    lastSeen: lastSeen,
                }
            })
        })())
    }

    await Promise.allSettled(updates)

    return NextResponse.json({ success: true, updated: updates.length })
}

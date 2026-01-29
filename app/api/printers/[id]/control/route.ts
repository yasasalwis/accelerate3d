import {NextRequest, NextResponse} from "next/server"
import {db} from "@/lib/db"

type ControlAction = "pause" | "resume" | "cancel"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const action = body.action as ControlAction

        if (!["pause", "resume", "cancel"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        // Fetch printer from database
        const printer = await db.userPrinter.findUnique({
            where: { id }
        })

        if (!printer) {
            return NextResponse.json({ error: "Printer not found" }, { status: 404 })
        }

        // Only Moonraker supports control commands currently
        if (printer.protocol !== "MOONRAKER") {
            return NextResponse.json(
                { error: "Control commands are only supported for Moonraker printers" },
                { status: 400 }
            )
        }

        const baseUrl = `http://${printer.ipAddress}`
        let endpoint = ""

        switch (action) {
            case "pause":
                endpoint = "/printer/print/pause"
                break
            case "resume":
                endpoint = "/printer/print/resume"
                break
            case "cancel":
                endpoint = "/printer/print/cancel"
                break
        }

        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: "POST",
            signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Printer command failed: ${error}`)
        }

        // Update printer status in database
        if (action === "pause") {
            await db.userPrinter.update({
                where: { id },
                data: { status: "PAUSED" }
            })
        } else if (action === "resume") {
            await db.userPrinter.update({
                where: { id },
                data: { status: "PRINTING" }
            })
        } else if (action === "cancel") {
            // Update printer and job status
            await db.userPrinter.update({
                where: { id },
                data: { status: "IDLE", currentJobId: null }
            })

            // Mark the current printing job as failed
            await db.printJob.updateMany({
                where: { userPrinterId: id, status: "PRINTING" },
                data: { status: "FAILED", endTime: new Date() }
            })
        }

        return NextResponse.json({ success: true, action })

    } catch (error) {
        console.error("Error controlling printer:", error)
        return NextResponse.json({ error: "Failed to control printer" }, { status: 500 })
    }
}

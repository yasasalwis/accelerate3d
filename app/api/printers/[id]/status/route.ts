import {NextRequest, NextResponse} from "next/server"
import {db} from "@/lib/db"
import {getPrinterClient} from "@/lib/printer-client"

export async function GET(
    _req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params

        // Fetch printer from database
        const printer = await db.userPrinter.findUnique({
            where: {id},
            include: {
                jobs: {
                    where: {status: "PRINTING"},
                    take: 1,
                    include: {model: true}
                }
            }
        })

        if (!printer) {
            return NextResponse.json({error: "Printer not found"}, {status: 404})
        }

        // Get live status from the printer
        const client = await getPrinterClient(printer.ipAddress, printer.protocol)
        const liveStatus = await client.getStatus()

        const activeJob = printer.jobs[0]
        let progress = liveStatus.progress || 0
        let timeLeft: string | undefined

        // Calculate time remaining if actively printing
        if (liveStatus.state === "PRINTING") {
            let remainingSeconds = 0;
            let hasTimeData = false;

            // Priority 1: Use live data from printer
            if (liveStatus.totalDuration && liveStatus.printDuration && liveStatus.totalDuration > 0) {
                remainingSeconds = Math.max(0, liveStatus.totalDuration - liveStatus.printDuration);
                hasTimeData = true;
            }
            // Priority 2: Use DB estimation
            else if (activeJob?.startTime && activeJob.model.estimatedTime) {
                const elapsedSeconds = (Date.now() - activeJob.startTime.getTime()) / 1000;
                remainingSeconds = Math.max(0, activeJob.model.estimatedTime - elapsedSeconds);
                hasTimeData = true;

                // Calculate progress from time if not provided by printer
                if (!liveStatus.progress) {
                    progress = Math.min(99, Math.round((elapsedSeconds / activeJob.model.estimatedTime) * 100));
                }
            }

            if (hasTimeData) {
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                timeLeft = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            }
        }

        return NextResponse.json({
            id: printer.id,
            name: printer.name,
            ipAddress: printer.ipAddress,
            protocol: printer.protocol,
            webcamUrl: printer.webcamUrl,
            status: liveStatus.state,
            temps: liveStatus.temps || {nozzle: 0, bed: 0},
            progress,
            timeLeft,
            filename: liveStatus.filename || activeJob?.model.name,
            activeJobId: activeJob?.id
        })

    } catch (error) {
        console.error("Error fetching printer status:", error)
        return NextResponse.json({error: "Failed to fetch printer status"}, {status: 500})
    }
}

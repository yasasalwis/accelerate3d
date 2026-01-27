
import { db } from "@/lib/db"
import { PrinterStatus } from "@/components/ui/printer-card"

export async function getPrinterStats() {
    const printers = await db.printer.findMany({
        select: {
            status: true
        }
    })

    const stats = {
        active: 0,
        idle: 0,
        error: 0,
        offline: 0,
        total: printers.length
    }

    printers.forEach(p => {
        // Normalize status to lowercase for comparison or just switch
        // Assuming DB stores uppercase as per schema default "IDLE"
        const status = p.status.toUpperCase() as PrinterStatus
        if (status === 'PRINTING') stats.active++
        else if (status === 'IDLE') stats.idle++
        else if (status === 'ERROR') stats.error++
        else if (status === 'OFFLINE') stats.offline++
    })

    return [
        { name: 'Active', value: stats.active, color: 'var(--blood-red-600)' },
        { name: 'Idle', value: stats.idle, color: '#52525b' },
        { name: 'Error', value: stats.error, color: '#ef4444' },
        { name: 'Offline', value: stats.offline, color: '#27272a' },
    ]
}

export async function getDashboardStats() {
    // In a real app, these would be aggregated from PrintJob and MaterialStats tables
    // For now, we'll try to calculate what we can or return placeholders if data is missing

    // Calculate total print hours (completed jobs)
    const completedJobs = await db.printJob.findMany({
        where: { status: 'COMPLETED', startTime: { not: null }, endTime: { not: null } },
        select: { startTime: true, endTime: true }
    })

    let totalHours = 0
    completedJobs.forEach(job => {
        if (job.startTime && job.endTime) {
            const durationMs = job.endTime.getTime() - job.startTime.getTime()
            totalHours += durationMs / (1000 * 60 * 60)
        }
    })

    // Filament used could be summed from PrintJob -> Model -> filamentGrams
    // For now we will mock this part or implement if Model data exists
    // Let's return the structure expected by the UI

    return [
        { title: "Print Hours", value: `${Math.round(totalHours)}h`, icon: "Activity", change: "Lifetime", sub: "Total Runtime" },
        { title: "Filament Used", value: "0 kg", icon: "Layers", change: "0 kg today", sub: "Material Usage" }, // Placeholder
        { title: "Est. Cost", value: "$0.00", icon: "Zap", change: "Current Month", sub: "Power + Material" }, // Placeholder
    ]
}

export async function getActivePrinters() {
    // Fetch printers and their current job if printing
    // We need to know which job is current. Schema has currentJobId on Printer.

    const printers = await db.printer.findMany({
        include: {
            jobs: {
                where: { status: 'PRINTING' },
                take: 1,
                include: {
                    model: true
                }
            }
        }
    })

    return printers.map(p => {
        const activeJob = p.jobs[0]

        // Calculate progress/time left if possible
        // For now, hardcode or calculate based on startTime and model.estimatedTime
        let progress = 0
        let timeLeft = "0m"

        if (activeJob && activeJob.startTime && activeJob.model.estimatedTime) {
            const elapsedSeconds = (new Date().getTime() - activeJob.startTime.getTime()) / 1000
            progress = Math.min(100, Math.round((elapsedSeconds / activeJob.model.estimatedTime) * 100))
            const remainingSeconds = Math.max(0, activeJob.model.estimatedTime - elapsedSeconds)
            const hours = Math.floor(remainingSeconds / 3600)
            const minutes = Math.floor((remainingSeconds % 3600) / 60)
            timeLeft = `${hours}h ${minutes}m`
        }

        return {
            id: p.id,
            name: p.name,
            status: p.status as PrinterStatus,
            progress: activeJob ? progress : 0,
            timeLeft: activeJob ? timeLeft : undefined,
            temps: { nozzle: 0, bed: 0 }, // Not in DB yet, would need telemetry
            file: activeJob?.model.name || undefined
        }
    })
}

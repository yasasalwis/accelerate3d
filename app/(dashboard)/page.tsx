import {db} from "@/lib/db"
import DashboardClient, {FleetData, MetricStat, PrinterData} from "@/components/dashboard/dashboard-client"
import {PrinterStatus} from "@/components/ui/printer-card"
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    // 1. Fetch Printers
    const printers = await db.userPrinter.findMany({
        where: {
            userId: (session.user as SessionUser).id
        },
        orderBy: {createdAt: 'desc'},
        include: {
            jobs: {
                where: {status: 'PRINTING'},
                take: 1,
                include: {model: true}
            }
        }
    })

    // 2. Map Printers to Dashboard Data
    const printerData: PrinterData[] = printers.map(p => {
        const activeJob = p.jobs[0]
        const isPrinting = p.status === 'PRINTING'

        let progress = undefined
        let timeLeft = undefined

        if (isPrinting && activeJob && activeJob.startTime) {
            const now = new Date()
            const elapsedMs = now.getTime() - activeJob.startTime.getTime()
            const elapsedSeconds = elapsedMs / 1000
            const estimatedTotal = activeJob.model.estimatedTime || 1

            // Calculate progress percentage
            progress = Math.min(Math.round((elapsedSeconds / estimatedTotal) * 100), 99)

            // Calculate time left string
            const remainingSeconds = Math.max(estimatedTotal - elapsedSeconds, 0)
            const h = Math.floor(remainingSeconds / 3600)
            const m = Math.floor((remainingSeconds % 3600) / 60)

            if (h > 0) {
                timeLeft = `${h}h ${m}m`
            } else if (m > 0) {
                timeLeft = `${m}m`
            } else {
                timeLeft = "< 1m"
            }
        }

        return {
            id: p.id,
            name: p.name,
            status: p.status as PrinterStatus,
            progress,
            timeLeft,
            temps: isPrinting ? {nozzle: 245, bed: 100} : undefined, // Currently hardcoded; needs a Telemetry table
            file: activeJob?.model.name || undefined,
            ipAddress: p.ipAddress
        }
    })

    // 3. Calculate Fleet Status Counts
    const activeCount = printers.filter(p => p.status === 'PRINTING').length
    const idleCount = printers.filter(p => p.status === 'IDLE').length
    const errorCount = printers.filter(p => p.status === 'ERROR').length
    const offlineCount = printers.filter(p => p.status === 'OFFLINE').length
    const totalPrinters = printers.length

    const fleetData: FleetData[] = [
        {name: 'Active', value: activeCount, color: '#CCFF00'}, // Cyber Lime
        {name: 'Idle', value: idleCount, color: '#00FFFF'}, // Neon Cyan
        {name: 'Error', value: errorCount, color: '#FF0033'}, // Neon Red
        {name: 'Offline', value: offlineCount, color: '#1e293b'}, // Slate-800
    ]

    const activePercentage = totalPrinters > 0 ? Math.round((activeCount / totalPrinters) * 100) : 0

    // 4. Calculate Aggregate Stats (Print Hours, Filament, Cost) based on History
    // Fetch completed jobs
    const completedJobs = await db.printJob.findMany({
        where: {
            status: 'COMPLETED',
            userPrinter: {
                userId: (session.user as SessionUser).id
            }
        },
        include: {model: true}
    })

    let totalPrintHours = 0
    let totalFilamentGrams = 0

    completedJobs.forEach(job => {
        // Use stored job time if available, or estimated time from model
        // Use actualDuration if available (most accurate), then fallback to timestamps, then estimate
        if (job.actualDuration && job.actualDuration > 0) {
            totalPrintHours += job.actualDuration / 3600
        } else if (job.startTime && job.endTime) {
            const durationMs = job.endTime.getTime() - job.startTime.getTime()
            totalPrintHours += durationMs / (1000 * 60 * 60)
        } else {
            totalPrintHours += (job.model.estimatedTime || 0) / 3600 // estimatedTime in seconds
        }

        totalFilamentGrams += job.model.filamentGrams || 0
    })

    // Estimate Cost: $20/kg -> $0.02/gram. Add power cost estimate e.g. 0.1 kW * hours * $0.15/kWh
    const materialCost = totalFilamentGrams * 0.025 // slightly markup
    const powerCost = totalPrintHours * 0.15 * 0.15 // rough estimate
    const totalCost = materialCost + powerCost

    const stats: MetricStat[] = [
        {
            title: "Print Hours",
            value: `${Math.round(totalPrintHours)}h`,
            icon: "Activity",
            change: "Lifetime",
            sub: "Total Runtime",
            color: "neon-cyan"
        },
        {
            title: "Filament Used",
            value: `${(totalFilamentGrams / 1000).toFixed(1)} kg`,
            icon: "Layers",
            change: "Lifetime",
            sub: "Material Usage",
            color: "neon-lime"
        },
        {
            title: "Est. Cost",
            value: `$${totalCost.toFixed(2)}`,
            icon: "Zap",
            change: "Lifetime",
            sub: "Power + Material",
            color: "neon-red"
        },
    ]

    return (
        <DashboardClient
            printers={printerData}
            stats={stats}
            fleetData={fleetData}
            activePercentage={activePercentage}
        />
    )
}

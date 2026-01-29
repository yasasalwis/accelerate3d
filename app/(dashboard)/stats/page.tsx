import {db} from "@/lib/db"
import AnalyticsClient from "@/components/stats/analytics-client"
import {addDays, format, subDays} from "date-fns"

import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

export default async function StatsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")
    const userId = (session.user as SessionUser).id

    // 1. Fetch Print Jobs
    const allJobs = await db.printJob.findMany({
        where: {
            userPrinter: {
                userId: userId
            }
        },
        include: {model: true},
        orderBy: {endTime: 'asc'}
    })

    const completedJobs = allJobs.filter(job => job.status === 'COMPLETED')
    const failedJobs = allJobs.filter(job => job.status === 'FAILED')
    const cancelledJobs = allJobs.filter(job => job.status === 'CANCELLED')

    // 2. Fetch Active Nodes (Printers)
    const activeNodesCount = await db.userPrinter.count({
        where: {
            userId: userId,
            status: {not: 'OFFLINE'}
        }
    })
    const totalNodesCount = await db.userPrinter.count({
        where: {userId: userId}
    })

    // 3. Fetch Material Stats
    const materialStats = await db.materialStats.findMany()

    // --- CALCULATIONS ---

    // A. Fleet Success Rate
    const totalFinishedJobs = completedJobs.length + failedJobs.length + cancelledJobs.length
    const successRate = totalFinishedJobs > 0
        ? ((completedJobs.length / totalFinishedJobs) * 100).toFixed(1)
        : "100.0" // Default to 100 if no bad jobs yet? Or 0? Let's say 100 for optimism if empty, or 0. Let's do 0 if 0 jobs.
    const successRateDisplay = totalFinishedJobs > 0 ? `${successRate}%` : "N/A"

    // B. Avg Print Time
    // Calculate actual duration if start/end exist, else use estimated
    let totalSeconds = 0
    let countForAvg = 0
    completedJobs.forEach(job => {
        if (job.startTime && job.endTime) {
            const duration = (job.endTime.getTime() - job.startTime.getTime()) / 1000
            totalSeconds += duration
            countForAvg++
        } else if (job.model.estimatedTime) {
            totalSeconds += job.model.estimatedTime
            countForAvg++
        }
    })
    const avgSeconds = countForAvg > 0 ? totalSeconds / countForAvg : 0
    const avgHours = Math.floor(avgSeconds / 3600)
    const avgMinutes = Math.floor((avgSeconds % 3600) / 60)
    const avgPrintTimeDisplay = `${avgHours}h ${avgMinutes}m`

    // C. Total Material
    const totalGrams = completedJobs.reduce((acc, job) => acc + (job.model.filamentGrams || 0), 0)
    const totalMaterialDisplay = totalGrams > 1000
        ? `${(totalGrams / 1000).toFixed(1)}kg`
        : `${totalGrams.toFixed(0)}g`

    // D. Active Nodes Display
    const activeNodesDisplay = `${activeNodesCount}/${totalNodesCount}`

    // --- CHART DATA PREPARATION ---

    // Group by Date (last 30 days usually, but let's take what we have)
    const dailyUsage = new Map<string, { grams: number, seconds: number }>()

    completedJobs.forEach(job => {
        if (!job.endTime) return
        const dateKey = format(job.endTime, 'MMM dd')
        const existing = dailyUsage.get(dateKey) || {grams: 0, seconds: 0}

        let seconds: number
        if (job.startTime) {
            seconds = (job.endTime.getTime() - job.startTime.getTime()) / 1000
        } else {
            seconds = job.model.estimatedTime || 0
        }

        dailyUsage.set(dateKey, {
            grams: existing.grams + (job.model.filamentGrams || 0),
            seconds: existing.seconds + seconds
        })
    })

    // Fill in missing days if needed? For now let's just use the entries we have if sparse, 
    // or generic "last 7 days" if we want a continuous graph.
    // Let's ensure at least last 7 days exist for a nice graph
    const chartData = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i)
        const key = format(d, 'MMM dd')
        const data = dailyUsage.get(key) || {grams: 0, seconds: 0}
        chartData.push({
            date: key,
            grams: data.grams,
            hours: parseFloat((data.seconds / 3600).toFixed(1)),
            isProjected: false
        })
    }

    // --- PROJECTIONS ---
    // Simple linear projection based on average of last 7 days
    const avgDailyGrams = chartData.reduce((sum, d) => sum + d.grams, 0) / chartData.length
    const avgDailyHours = chartData.reduce((sum, d) => sum + d.hours, 0) / chartData.length

    // Project next 3 days
    for (let i = 1; i <= 3; i++) {
        const d = addDays(today, i)
        const key = format(d, 'MMM dd')
        chartData.push({
            date: key,
            grams: Math.round(avgDailyGrams), // integer grams
            hours: parseFloat(avgDailyHours.toFixed(1)),
            isProjected: true
        })
    }

    // Stats object
    const stats = {
        successRate: successRateDisplay,
        avgPrintTime: avgPrintTimeDisplay,
        totalMaterial: totalMaterialDisplay,
        activeNodes: activeNodesDisplay
    }

    return (
        <div className="space-y-6">
            <AnalyticsClient
                usageData={chartData}
                materialStats={materialStats}
                stats={stats}
            />
        </div>
    )
}


import { db } from "@/lib/db"
import AnalyticsClient from "@/components/stats/analytics-client"

export default async function StatsPage() {
    // Fetch data for analytics
    const completedJobs = await db.printJob.findMany({
        where: { status: 'COMPLETED' },
        include: { model: true },
        orderBy: { endTime: 'asc' }
    })

    const materialStats = await db.materialStats.findMany()

    // Process data for charts
    // 1. Success Rate over time (mocked for now if not enough actual data)
    const usageData = completedJobs.map(job => ({
        date: job.endTime?.toLocaleDateString() || 'N/A',
        grams: job.model.filamentGrams,
        hours: (job.model.estimatedTime || 0) / 3600
    }))

    return (
        <div className="space-y-6">
            <AnalyticsClient usageData={usageData} materialStats={materialStats as any} />
        </div>
    )
}

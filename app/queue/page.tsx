import { db } from "@/lib/db"
import QueueClient from "@/components/queue/queue-client"

export default async function QueuePage() {
    const dbJobs = await db.printJob.findMany({
        include: {
            model: true,
            userPrinter: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const jobs = dbJobs.map(job => ({
        ...job,
        printer: {
            name: job.userPrinter.name
        }
    }))

    const models = await db.model.findMany()

    return (
        <div className="space-y-6">
            <QueueClient initialJobs={jobs as any} models={models as any} />
        </div>
    )
}

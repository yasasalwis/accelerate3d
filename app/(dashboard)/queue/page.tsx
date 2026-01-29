import {db} from "@/lib/db"
import QueueClient from "@/components/queue/queue-client"

import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

export default async function QueuePage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")

    const dbJobs = await db.printJob.findMany({
        where: {
            userPrinter: {
                userId: (session.user as SessionUser).id
            }
        },
        include: {
            model: true,
            userPrinter: true
        },
        orderBy: {createdAt: 'desc'}
    })

    const jobs = dbJobs.map(job => ({
        ...job,
        model: {
            ...job.model,
            thumbnailUrl: job.model.thumbnailUrl || undefined
        },
        printer: {
            name: job.userPrinter.name
        }
    }))

    const models = await db.model.findMany()

    return (
        <div className="space-y-6">
            <QueueClient initialJobs={jobs} models={models}/>
        </div>
    )
}

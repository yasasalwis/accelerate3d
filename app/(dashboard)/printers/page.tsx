import { db } from "@/lib/db"
import PrintersClient from "@/components/printers/printers-client"
import { PrinterStatus } from "@/components/ui/printer-card"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

export default async function PrintersPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")

    // Fetch printers assigned to the user
    const userPrinters = await db.userPrinter.findMany({
        where: { userId: (session.user as SessionUser).id },
        include: {
            printer: true,
            jobs: {
                where: { status: 'PRINTING' },
                take: 1,
                include: { model: true }
            }
        }
    })

    const printerData = userPrinters.map(up => {
        const activeJob = up.jobs[0]
        const isPrinting = up.status === 'PRINTING'

        let progress = undefined
        let timeLeft = undefined

        if (isPrinting && activeJob && activeJob.startTime) {
            const now = new Date()
            const elapsedMs = now.getTime() - activeJob.startTime.getTime()
            const elapsedSeconds = elapsedMs / 1000
            const estimatedTotal = activeJob.model.estimatedTime || 1
            progress = Math.min(Math.round((elapsedSeconds / estimatedTotal) * 100), 99)
            const remainingSeconds = Math.max(estimatedTotal - elapsedSeconds, 0)
            const h = Math.floor(remainingSeconds / 3600)
            const m = Math.floor((remainingSeconds % 3600) / 60)
            timeLeft = h > 0 ? `${h}h ${m}m` : `${m}m`
        }

        return {
            id: up.id,
            name: up.name,
            status: up.status as PrinterStatus,
            progress,
            timeLeft,
            temps: isPrinting ? { nozzle: 245, bed: 100 } : undefined,
            file: activeJob?.model.name || undefined,
            imageUrl: up.printer.imageUrl || undefined,
            ipAddress: up.ipAddress,
            protocol: up.protocol,
            lastSeen: up.lastSeen
        }
    })

    return (
        <div className="space-y-6">
            <PrintersClient initialPrinters={printerData} />
        </div>
    )
}

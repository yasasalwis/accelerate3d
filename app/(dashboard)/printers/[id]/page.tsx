import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import PrinterDetailClient from "@/components/printers/printer-detail-client"

export default async function PrinterDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const printer = await db.userPrinter.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            ipAddress: true,
            protocol: true,
            webcamUrl: true
        }
    })

    if (!printer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <PrinterDetailClient
                printerId={printer.id}
                initialData={{
                    name: printer.name,
                    ipAddress: printer.ipAddress,
                    protocol: printer.protocol,
                    webcamUrl: printer.webcamUrl
                }}
            />
        </div>
    )
}

export default async function PrinterDetailPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Printer Details: {id}</h1>
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Live telemetry and control panel implementation pending.
            </div>
        </div>
    )
}

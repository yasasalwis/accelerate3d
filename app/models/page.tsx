import { db } from "@/lib/db"
import { ModelCard } from "@/components/ui/model-card"
import { Plus, Upload } from "lucide-react"

export default async function ModelsPage() {
    const models = await db.model.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase font-rajdhani text-white">3D Models</h1>
                    <p className="text-sm text-zinc-500 font-mono">Project source files and scanned assets.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-all font-rajdhani uppercase tracking-wider">
                        <Upload className="size-4" />
                        Import STL
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-neon-red text-white rounded-lg text-sm font-bold hover:glow-red transition-all font-rajdhani uppercase tracking-wider">
                        <Plus className="size-4" />
                        New Project
                    </button>
                </div>
            </div>

            {models.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] rounded-2xl border border-dashed border-white/10 bg-zinc-900/20">
                    <div className="size-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                        <Upload className="size-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold font-rajdhani uppercase text-zinc-400">No Models Found</h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Upload your first 3D model to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {models.map((model) => (
                        <ModelCard
                            key={model.id}
                            name={model.name}
                            thumbnailUrl={model.thumbnailUrl}
                            dimensions={{
                                width: model.widthMm,
                                depth: model.depthMm,
                                height: model.heightMm
                            }}
                            estimatedTime={model.estimatedTime}
                            filamentGrams={model.filamentGrams}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

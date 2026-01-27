"use client"

import * as React from "react"
import { ModelCard } from "@/components/ui/model-card"
import { Plus, Upload, Loader2, FileCode } from "lucide-react"
import { UploadModelModal } from "@/components/models/upload-model-modal"
import { QueueModelModal } from "@/components/models/queue-model-modal"
import { Button } from "@/components/ui/button"

export default function ModelsPage() {
    const [models, setModels] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
    const [queueModal, setQueueModal] = React.useState<{ isOpen: boolean, modelId: string | null, modelName: string | null }>({
        isOpen: false,
        modelId: null,
        modelName: null
    })

    const fetchModels = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/models")
            if (response.ok) {
                const data = await response.json()
                setModels(data)
            }
        } catch (error) {
            console.error("Failed to fetch models", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchModels()
    }, [fetchModels])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase font-rajdhani text-white">3D Models</h1>
                    <p className="text-sm text-zinc-500 font-mono">Project source files and scanned assets.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-all font-rajdhani uppercase tracking-wider"
                    >
                        <FileCode className="size-4" />
                        Import G-CODE
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-neon-red text-white rounded-lg text-sm font-bold hover:glow-red transition-all font-rajdhani uppercase tracking-wider"
                    >
                        <Plus className="size-4" />
                        New Project
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 className="size-12 text-neon-red animate-spin mb-4" />
                    <p className="text-zinc-500 font-mono text-sm uppercase">Synchronizing Library...</p>
                </div>
            ) : models.length === 0 ? (
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
                            material={model.material}
                            onPrint={() => setQueueModal({
                                isOpen: true,
                                modelId: model.id,
                                modelName: model.name
                            })}
                        />
                    ))}
                </div>
            )}

            <UploadModelModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={fetchModels}
            />

            <QueueModelModal
                isOpen={queueModal.isOpen}
                onClose={() => setQueueModal({ ...queueModal, isOpen: false })}
                modelId={queueModal.modelId}
                modelName={queueModal.modelName}
            />
        </div>
    )
}

"use client"

import { useState } from "react"
import { ListOrdered, LayoutGrid, Zap, MoveRight, CheckCircle2, AlertCircle, Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { schedulePrint } from "@/lib/actions"

interface Job {
    id: string
    status: string
    model: {
        name: string
        thumbnailUrl?: string
        estimatedTime: number
    }
    printer?: {
        name: string
    }
    createdAt: Date
}

interface Model {
    id: string
    name: string
}

export default function QueueClient({ initialJobs, models }: { initialJobs: Job[], models: Model[] }) {
    const [jobs, setJobs] = useState(initialJobs)
    const [isScheduling, setIsScheduling] = useState(false)
    const [selectedModel, setSelectedModel] = useState("")
    const [quantity, setQuantity] = useState(1)

    const columns = [
        { id: "PENDING", title: "Backlog", color: "text-zinc-400", bg: "bg-zinc-800/20" },
        { id: "PRINTING", title: "Active", color: "text-neon-lime", bg: "bg-neon-lime/5" },
        { id: "COMPLETED", title: "Done", color: "text-neon-cyan", bg: "bg-neon-cyan/5" },
        { id: "FAILED", title: "Failed", color: "text-neon-red", bg: "bg-neon-red/5" },
    ]

    const handleSchedule = async () => {
        if (!selectedModel) return
        setIsScheduling(true)
        try {
            await schedulePrint(selectedModel, quantity)
            // Revalidation will handle the UI update usually, but for instant feedback:
            window.location.reload()
        } catch (e: any) {
            alert(e.message)
        } finally {
            setIsScheduling(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header / Smart Scheduler */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 glass flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase font-rajdhani text-white flex items-center gap-3">
                        <Zap className="size-6 text-neon-red fill-neon-red/20" />
                        Smart Scheduler
                    </h1>
                    <p className="text-sm text-zinc-500 font-mono">Auto-distribute prints across compatible machines.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">Select Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-neon-red/30 w-48 text-zinc-300"
                        >
                            <option value="">Choose Model...</option>
                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">Qty</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neon-red/30 w-20 text-center"
                        />
                    </div>

                    <button
                        onClick={handleSchedule}
                        disabled={!selectedModel || isScheduling}
                        className="h-10 px-6 mt-5 bg-neon-red text-white rounded-lg text-sm font-bold hover:glow-red transition-all font-rajdhani uppercase tracking-wider disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                    >
                        {isScheduling ? "Calculating..." : "Auto-Distribute"}
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[60vh]">
                {columns.map((col) => (
                    <div key={col.id} className={cn("flex flex-col gap-4 rounded-2xl p-4 border border-white/5", col.bg)}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={cn("font-bold font-rajdhani uppercase tracking-tighter text-lg", col.color)}>
                                {col.title}
                            </h3>
                            <span className="text-xs font-mono text-zinc-600 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                                {jobs.filter(j => j.status === col.id).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {jobs.filter(j => j.status === col.id).map((job) => (
                                <div
                                    key={job.id}
                                    className="group bg-zinc-950 border border-white/5 rounded-xl p-4 hover:border-white/10 hover:shadow-lg transition-all cursor-move"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold font-rajdhani uppercase text-sm text-zinc-200 truncate pr-2">{job.model.name}</h4>
                                        {job.status === "PRINTING" && <Play className="size-3 text-neon-lime animate-pulse" />}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mb-3">
                                        <Clock className="size-3" />
                                        <span>{Math.round(job.model.estimatedTime / 60)}m est.</span>
                                        {job.printer && (
                                            <>
                                                <span className="opacity-30">•</span>
                                                <span className="text-neon-cyan/60">{job.printer.name}</span>
                                            </>
                                        )}
                                    </div>

                                    {col.id === "PENDING" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => console.log('Cancel job', job.id)}
                                                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => console.log('Force start job', job.id)}
                                                className="flex-1 py-1.5 bg-neon-lime/10 text-neon-lime hover:bg-neon-lime/20 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                            >
                                                Force Start
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

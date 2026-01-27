"use client"

import { useState } from "react"
import { PrinterCard, PrinterStatus } from "@/components/ui/printer-card"
import { Plus, Search, Grid2X2, List } from "lucide-react"
import { PrinterSelectionModal } from "./printer-selection-modal"

interface Printer {
    id: string
    name: string
    status: PrinterStatus
    progress?: number
    timeLeft?: string
    temps?: { nozzle: number; bed: number }
    file?: string
}

export default function PrintersClient({ initialPrinters }: { initialPrinters: Printer[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase font-rajdhani text-white">Printer Farm</h1>
                    <p className="text-sm text-zinc-500 font-mono">Manage and monitor your connected 3D printers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-neon-red transition-colors" />
                        <input
                            placeholder="Search printers..."
                            className="bg-zinc-900/50 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-neon-red/30 outline-none transition-all w-64"
                        />
                    </div>

                    <div className="flex border border-white/5 rounded-lg overflow-hidden bg-zinc-900/50">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Grid2X2 className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <List className="size-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-neon-red text-white rounded-lg text-sm font-bold hover:glow-red transition-all font-rajdhani uppercase tracking-wider"
                    >
                        <Plus className="size-4" />
                        Add Printer
                    </button>
                </div>
            </div>

            {initialPrinters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] rounded-2xl border border-dashed border-white/10 bg-zinc-900/20">
                    <div className="size-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                        <Plus className="size-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold font-rajdhani uppercase text-zinc-400">No Printers Connected</h3>
                    <p className="text-sm text-zinc-500 font-mono mt-1">Start by adding a printer from the global registry.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 transition-all font-rajdhani"
                    >
                        Connect New Printer
                    </button>
                </div>
            ) : (
                <div className={viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }>
                    {initialPrinters.map((printer) => (
                        <PrinterCard key={printer.id} {...printer} />
                    ))}
                </div>
            )}

            <PrinterSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { X, Search, Check, Plus, Cpu, Layers } from "lucide-react"
import { getAvailablePrinters, addPrinterToUser } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface Printer {
    id: string
    name: string
    type: string
    definition?: {
        make: string
        model: string
        buildVolumeX: number
        buildVolumeY: number
        buildVolumeZ: number
    } | null
}

export function PrinterSelectionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [printers, setPrinters] = useState<Printer[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getAvailablePrinters().then(data => {
                setPrinters(data as any)
                setLoading(false)
            })
        }
    }, [isOpen])

    const handleAdd = async (id: string) => {
        setAdding(id)
        try {
            await addPrinterToUser(id)
            setPrinters(prev => prev.filter(p => p.id !== id))
        } catch (e) {
            console.error(e)
        } finally {
            setAdding(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold font-rajdhani uppercase tracking-tight text-white">Add Printer to Fleet</h2>
                        <p className="text-xs text-zinc-500 font-mono">Select a printer from the network registry to add to your dashboard.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-neon-cyan transition-colors" />
                        <input
                            placeholder="Filter by name or model..."
                            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="size-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : printers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
                            <Cpu className="size-12 mb-2 opacity-20" />
                            <p className="text-sm font-mono tracking-tighter">No available printers found on network.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {printers.map((printer) => (
                                <div
                                    key={printer.id}
                                    className="group p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-neon-cyan/30 hover:bg-neon-cyan/[0.02] transition-all cursor-pointer relative"
                                    onClick={() => !adding && handleAdd(printer.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold font-rajdhani uppercase text-zinc-200 group-hover:text-neon-cyan transition-colors">{printer.name}</h4>
                                            <p className="text-[10px] text-zinc-500 font-mono">{printer.type} SYSTEM</p>
                                        </div>
                                        <div className="bg-zinc-800 rounded-md p-1.5 group-hover:bg-neon-cyan/20 transition-colors">
                                            {adding === printer.id ? (
                                                <div className="size-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Plus className="size-4 text-zinc-500 group-hover:text-neon-cyan" />
                                            )}
                                        </div>
                                    </div>

                                    {printer.definition && (
                                        <div className="space-y-1.5 border-t border-white/5 pt-3">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                                <Layers className="size-3" />
                                                <span>{printer.definition.make} {printer.definition.model}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                                <Layers className="size-3 opacity-0" />
                                                <span>{printer.definition.buildVolumeX}x{printer.definition.buildVolumeY}x{printer.definition.buildVolumeZ} mm</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-rajdhani"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

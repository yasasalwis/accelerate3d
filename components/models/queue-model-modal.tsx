"use client"

import * as React from "react"
import {Loader2, Minus, Plus, Printer as PrinterIcon, Settings2, X, Zap} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {useNotifications} from "@/components/notifications/notification-context"

interface QueueModelModalProps {
    isOpen: boolean
    onClose: () => void
    modelId: string | null
    modelName: string | null
}

export function QueueModelModal({isOpen, onClose, modelId, modelName}: QueueModelModalProps) {
    const [printers, setPrinters] = React.useState<{ id: string; name: string; status?: string }[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [selectedPrinterId, setSelectedPrinterId] = React.useState<string | null>(null)
    const [isAutoQueue, setIsAutoQueue] = React.useState(true)
    const [quantity, setQuantity] = React.useState(1)
    const {showToast} = useNotifications()

    React.useEffect(() => {
        const fetchPrinters = async () => {
            setIsLoading(true)
            try {
                const response = await fetch("/api/printers")
                if (response.ok) {
                    const data = await response.json()
                    setPrinters(data)
                    if (data.length > 0 && !selectedPrinterId) {
                        setSelectedPrinterId(data[0].id)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch printers", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isOpen) {
            fetchPrinters()
        }
    }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps -- selectedPrinterId dependency logic is tricky, keeping simple

    const handleQueue = async () => {
        if (!modelId || (!isAutoQueue && !selectedPrinterId)) return

        setIsSubmitting(true)
        try {
            const response = await fetch("/api/jobs/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    modelId,
                    userPrinterId: isAutoQueue ? null : selectedPrinterId,
                    autoQueue: isAutoQueue,
                    quantity: quantity
                }),
            })

            if (response.ok) {
                showToast("SUCCESS", "Model Queued", `${quantity > 1 ? `${quantity}x ` : ""}"${modelName}" added to print queue`)
                onClose()
                // Reset state
                setIsAutoQueue(true)
                setQuantity(1)
            } else {
                const error = await response.json()
                showToast("ERROR", "Queue Failed", error.error || "Failed to add model to queue")
            }
        } catch (error) {
            console.error("Failed to queue job", error)
            showToast("ERROR", "Connection Error", "Failed to connect to server. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-rajdhani uppercase tracking-tight text-white">Queue
                            Configuration</h2>
                        <p className="text-xs text-zinc-500 font-mono">Setup print job for <span
                            className="text-neon-red">{modelName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <X className="size-5"/>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-800/50 rounded-xl border border-white/5">
                        <button
                            onClick={() => setIsAutoQueue(true)}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-rajdhani uppercase transition-all",
                                isAutoQueue
                                    ? "bg-neon-red text-white shadow-lg shadow-neon-red/20"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Zap className={cn("size-3.5", isAutoQueue ? "text-white" : "text-zinc-500")}/>
                            Auto Queue
                        </button>
                        <button
                            onClick={() => setIsAutoQueue(false)}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-rajdhani uppercase transition-all",
                                !isAutoQueue
                                    ? "bg-zinc-700 text-white border border-white/10"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Settings2 className={cn("size-3.5", !isAutoQueue ? "text-white" : "text-zinc-500")}/>
                            Manual Select
                        </button>
                    </div>

                    {/* Printer Selection (Manual Mode) */}
                    {!isAutoQueue && (
                        <div className="space-y-3">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest px-1">Choose
                                Target Printer</label>
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="size-6 text-neon-red animate-spin mb-3"/>
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Scanning Fleet...</p>
                                </div>
                            ) : printers.length === 0 ? (
                                <div
                                    className="text-center py-4 rounded-xl bg-zinc-800/20 border border-dashed border-white/5">
                                    <p className="text-xs text-zinc-500">No printers available.</p>
                                </div>
                            ) : (
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {printers.map((printer) => (
                                        <button
                                            key={printer.id}
                                            onClick={() => setSelectedPrinterId(printer.id)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                                selectedPrinterId === printer.id
                                                    ? "bg-neon-red/10 border-neon-red/50 ring-1 ring-neon-red/20"
                                                    : "bg-zinc-800/30 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "size-8 rounded-lg flex items-center justify-center",
                                                    selectedPrinterId === printer.id ? "bg-neon-red text-white" : "bg-zinc-800 text-zinc-500"
                                                )}>
                                                    <PrinterIcon className="size-4"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold font-rajdhani uppercase text-white text-sm leading-tight">{printer.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-mono italic">{printer.status || "IDLE"}</p>
                                                </div>
                                            </div>
                                            {selectedPrinterId === printer.id && (
                                                <div className="size-2 rounded-full bg-neon-red animate-pulse"/>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Auto Queue Info */}
                    {isAutoQueue && (
                        <div className="p-4 rounded-xl bg-neon-red/5 border border-neon-red/20 space-y-2">
                            <div className="flex items-start gap-3">
                                <Zap className="size-5 text-neon-red mt-0.5"/>
                                <div>
                                    <p className="text-xs font-bold font-rajdhani uppercase text-white">Smart Load
                                        Balancing</p>
                                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed mt-1">
                                        The system will automatically assign this job to the most efficient IDLE printer
                                        in your fleet. If all are busy, it will be queued for the printer with the
                                        shortest wait time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest px-1">Print
                            Quantity</label>
                        <div className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
                            >
                                <Minus className="size-4"/>
                            </button>
                            <div className="flex-1 text-center">
                                <span className="text-2xl font-bold font-rajdhani text-white">{quantity}</span>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase ml-2">Units</span>
                            </div>
                            <button
                                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
                            >
                                <Plus className="size-4"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 border border-white/10 text-zinc-400 hover:text-white font-rajdhani uppercase tracking-wider"
                            onClick={onClose}
                        >
                            Abort
                        </Button>
                        <Button
                            variant="premium"
                            className="flex-1 font-rajdhani uppercase tracking-wider h-11"
                            disabled={(!isAutoQueue && !selectedPrinterId) || isSubmitting}
                            onClick={handleQueue}
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin mr-2"/>
                            ) : (
                                <Zap className="size-4 mr-2"/>
                            )}
                            Commence Printing
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import {useEffect, useState} from "react"
import {Loader2, Save, X} from "lucide-react"
import {updateUserPrinter} from "@/lib/actions"

interface EditPrinterModalProps {
    isOpen: boolean
    onClose: () => void
    printer: {
        id: string
        name: string
        ipAddress: string
    } | null
}

export function EditPrinterModal({isOpen, onClose, printer}: EditPrinterModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [ipAddress, setIpAddress] = useState("")

    useEffect(() => {
        if (printer) {
            setName(printer.name)
            setIpAddress(printer.ipAddress)
        }
    }, [printer])

    if (!isOpen || !printer) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updateUserPrinter(printer.id, name, ipAddress)
            onClose()
        } catch (error) {
            console.error("Failed to update printer:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"/>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold font-rajdhani uppercase tracking-wide text-white">Edit
                                Printer</h2>
                            <p className="text-xs text-zinc-500 font-mono mt-1">Update connection details</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        >
                            <X className="size-5"/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Printer
                                Name</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono"
                                placeholder="e.g. Production Mk3S"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">IP
                                Address</label>
                            <input
                                required
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono"
                                placeholder="e.g. 192.168.1.100"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl font-bold text-sm transition-all uppercase tracking-wider font-rajdhani"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-neon-purple hover:bg-neon-purple/90 text-white rounded-xl font-bold text-sm transition-all uppercase tracking-wider font-rajdhani flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

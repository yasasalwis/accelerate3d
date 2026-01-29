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
        ejectGcode?: string | null
    } | null
}

export function EditPrinterModal({isOpen, onClose, printer}: EditPrinterModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [ipAddress, setIpAddress] = useState("")
    const [ejectGcode, setEjectGcode] = useState("")

    useEffect(() => {
        if (printer) {
            setName(printer.name)
            setIpAddress(printer.ipAddress)
            setEjectGcode(printer.ejectGcode || `; --- START OF PART REMOVAL SCRIPT ---
M104 S0 ; Turn off extruder heater immediately
M140 S0 ; Turn off bed heater

; 1. PREVENT MOTOR TIMEOUT
M84 S0  ; Disable motor idle timeout (Motors stay ON and locked)

; 2. WAIT FOR COOL DOWN
M190 R30 ; Wait for bed to cool down to 30C (Change 30 to your desired release temp)

; 3. PREPARE FOR RAMMING
G90 ; Absolute positioning
G28 X Y ; Home X and Y to ensure we know exactly where we are
G1 Z10 F3000 ; Lift Z to 10mm to avoid scraping while moving into position

; 4. POSITION BEHIND THE PART
; Change X110 to the center of your bed (e.g., 110 for Ender 3, 125 for Prusa)
; Change Y220 to the max Y of your bed (The very back)
G1 X110 Y220 F3000 

; 5. LOWER THE BOOM
; CAUTION: Ensure this height hits the part but DOES NOT hit the bed clips or surface
G1 Z2 F3000 ; Lower nozzle to 2mm above the bed

; 6. THE PUSH
; Move nozzle to the front (Y0), sweeping the part off the plate
G1 Y0 F1000 ; Move Y slowly (F1000) to push the part

; 7. FINISH
G1 Z50 ; Lift head out of the way
M84 ; Finally turn off motors (optional, remove if you want them to stay locked)
; --- END OF SCRIPT ---`)
        }
    }, [printer])

    if (!isOpen || !printer) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updateUserPrinter(printer.id, name, ipAddress, ejectGcode)
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
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Hostname or IP
                                Address</label>
                            <input
                                required
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono"
                                placeholder="e.g. 192.168.1.100 or my-printer.local"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Eject
                                G-code</label>
                            <textarea
                                value={ejectGcode}
                                onChange={(e) => setEjectGcode(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono min-h-[100px]"
                                placeholder="Enter G-code to run after print..."
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

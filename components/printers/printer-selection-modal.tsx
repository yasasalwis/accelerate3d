"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Cpu, Layers, Plus, Ruler, Search, X } from "lucide-react"
import { addPrinterToUser, getAvailablePrinters } from "@/lib/actions"
import Image from "next/image"

interface Printer {
    id: string
    manufacturer: { name: string }
    model: string
    imageUrl: string | null
    technology: { name: string }
    buildVolumeX: number
    buildVolumeY: number
    buildVolumeZ: number
    priceUsd: number | null
}

export function PrinterSelectionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [printers, setPrinters] = useState<Printer[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null)
    const [printerName, setPrinterName] = useState("")
    const [ipAddress, setIpAddress] = useState("")
    const [protocol, setProtocol] = useState("AUTO")

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            setSelectedPrinter(null)
            setPrinterName("")
            setIpAddress("")
            setProtocol("AUTO")
            getAvailablePrinters().then(data => {
                setPrinters(data as Printer[])
                setLoading(false)
            })
        }
    }, [isOpen])

    const handleSelectPrinter = (printer: Printer) => {
        setSelectedPrinter(printer)
        setPrinterName(`${printer.manufacturer.name} ${printer.model}`)
        setIpAddress("")
        setProtocol("AUTO")
    }

    const handleAdd = async () => {
        if (!selectedPrinter || !printerName.trim() || !ipAddress.trim()) return

        setAdding(true)
        try {
            await addPrinterToUser(selectedPrinter.id, printerName.trim(), ipAddress.trim(), protocol)
            setPrinters(prev => prev.filter(p => p.id !== selectedPrinter.id))
            setSelectedPrinter(null)
            setPrinterName("")
            setIpAddress("")
        } catch (e) {
            console.error(e)
        } finally {
            setAdding(false)
        }
    }

    const handleBack = () => {
        setSelectedPrinter(null)
        setPrinterName("")
        setIpAddress("")
    }

    const filteredPrinters = printers.filter(p =>
        searchQuery === "" ||
        p.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                {!selectedPrinter ? (
                    <>
                        {/* Header */}
                        <div
                            className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
                            <div>
                                <h2 className="text-2xl font-bold font-rajdhani uppercase tracking-tight text-white">Add
                                    Printer to Fleet</h2>
                                <p className="text-xs text-zinc-500 font-mono mt-1">Select a printer from the global
                                    registry to add to your dashboard.</p>
                            </div>
                            <button onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/5">
                            <div className="relative group">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-neon-cyan transition-colors" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter by manufacturer or model..."
                                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-48">
                                    <div
                                        className="size-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredPrinters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
                                    <Cpu className="size-12 mb-2 opacity-20" />
                                    <p className="text-sm font-mono tracking-tighter">
                                        {searchQuery ? "No printers match your search." : "No available printers found on network."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredPrinters.map((printer) => (
                                        <div
                                            key={printer.id}
                                            className="group bg-zinc-900/40 border border-white/5 rounded-xl hover:border-neon-cyan/30 hover:bg-neon-cyan/[0.02] transition-all cursor-pointer overflow-hidden"
                                            onClick={() => handleSelectPrinter(printer)}
                                        >
                                            {/* Image Section */}
                                            <div
                                                className="relative h-40 bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                                                {printer.imageUrl ? (
                                                    <Image
                                                        src={printer.imageUrl}
                                                        alt={`${printer.manufacturer.name} ${printer.model}`}
                                                        width={200}
                                                        height={160}
                                                        className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <Cpu className="size-16 text-zinc-700" />
                                                )}

                                                {/* Add Button Overlay */}
                                                <div
                                                    className="absolute top-2 right-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg p-2 group-hover:bg-neon-cyan/20 transition-colors border border-white/10">
                                                    <Plus
                                                        className="size-4 text-zinc-400 group-hover:text-neon-cyan transition-colors" />
                                                </div>
                                            </div>

                                            {/* Info Section */}
                                            <div className="p-4 space-y-3">
                                                {/* Manufacturer & Model */}
                                                <div>
                                                    <div
                                                        className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                                        {printer.manufacturer.name}
                                                    </div>
                                                    <h4 className="font-bold font-rajdhani text-lg uppercase text-white group-hover:text-neon-cyan transition-colors leading-tight">
                                                        {printer.model}
                                                    </h4>
                                                </div>

                                                {/* Specs */}
                                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                                    <div
                                                        className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                                                        <Layers className="size-3 text-zinc-600" />
                                                        <span>{printer.technology.name}</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                                                        <Ruler className="size-3 text-zinc-600" />
                                                        <span>{printer.buildVolumeX}×{printer.buildVolumeY}×{printer.buildVolumeZ} mm</span>
                                                    </div>
                                                    {printer.priceUsd && (
                                                        <div
                                                            className="text-[11px] text-neon-cyan font-bold font-mono pt-1">
                                                            ${printer.priceUsd.toLocaleString()} USD
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                            <p className="text-xs text-zinc-600 font-mono">
                                {filteredPrinters.length} {filteredPrinters.length === 1 ? 'printer' : 'printers'} available
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-rajdhani"
                            >
                                Done
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Configuration Header */}
                        <div
                            className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="size-5" />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold font-rajdhani uppercase tracking-tight text-white">Configure
                                        Printer</h2>
                                    <p className="text-xs text-zinc-500 font-mono mt-1">Set a custom name and IP address
                                        for this printer.</p>
                                </div>
                            </div>
                            <button onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Configuration Form */}
                        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                            <div className="max-w-2xl mx-auto space-y-6">
                                {/* Printer Preview */}
                                <div
                                    className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div
                                        className="w-20 h-20 bg-zinc-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {selectedPrinter.imageUrl ? (
                                            <Image
                                                src={selectedPrinter.imageUrl}
                                                alt={`${selectedPrinter.manufacturer.name} ${selectedPrinter.model}`}
                                                width={80}
                                                height={80}
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <Cpu className="size-8 text-zinc-700" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                            {selectedPrinter.manufacturer.name}
                                        </div>
                                        <h4 className="font-bold font-rajdhani text-xl uppercase text-white">
                                            {selectedPrinter.model}
                                        </h4>
                                        <div className="text-xs text-zinc-400 font-mono mt-1">
                                            {selectedPrinter.technology.name} • {selectedPrinter.buildVolumeX}×{selectedPrinter.buildVolumeY}×{selectedPrinter.buildVolumeZ} mm
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-mono text-zinc-400 mb-2">
                                            Printer Name <span className="text-neon-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={printerName}
                                            onChange={(e) => setPrinterName(e.target.value)}
                                            placeholder="e.g., My Workshop Printer"
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all"
                                        />
                                        <p className="text-xs text-zinc-600 font-mono mt-1">
                                            A friendly name to identify this printer in your fleet
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-mono text-zinc-400 mb-2">
                                            IP Address <span className="text-neon-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={ipAddress}
                                            onChange={(e) => setIpAddress(e.target.value)}
                                            placeholder="e.g., 192.168.1.100"
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all"
                                        />
                                        <p className="text-xs text-zinc-600 font-mono mt-1">
                                            The local network IP address of your printer
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-mono text-zinc-400 mb-2">
                                            Protocol
                                        </label>
                                        <select
                                            value={protocol}
                                            onChange={(e) => setProtocol(e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all text-white appearance-none"
                                        >
                                            <option value="AUTO">Auto Detect</option>
                                            <option value="MOONRAKER">Moonraker</option>
                                            <option value="MQTT">MQTT</option>
                                        </select>
                                        <p className="text-xs text-zinc-600 font-mono mt-1">
                                            Select the communication protocol manually if detection fails
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-rajdhani"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={adding || !printerName.trim() || !ipAddress.trim()}
                                className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-neon-cyan text-black hover:bg-neon-cyan/90 transition-colors font-rajdhani disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {adding ? (
                                    <>
                                        <div
                                            className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add to Fleet'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

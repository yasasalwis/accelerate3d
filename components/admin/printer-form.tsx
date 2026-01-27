"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { createMarketPrinter, deleteMarketPrinter } from "@/lib/admin-actions"

interface Manufacturer {
    id: string
    name: string
}

interface Technology {
    id: string
    name: string
}

interface Feature {
    id: string
    name: string
}

interface Printer {
    id: string
    model: string
    manufacturer: { name: string }
    technology: { name: string }
    buildVolumeX: number
    buildVolumeY: number
    buildVolumeZ: number
    priceUsd: number | null
    features: Array<{ feature: { name: string } }>
}

interface PrinterFormProps {
    manufacturers: Manufacturer[]
    technologies: Technology[]
    features: Feature[]
    printers: Printer[]
    onRefresh: () => void
}

export function PrinterForm({ manufacturers, technologies, features, printers, onRefresh }: PrinterFormProps) {
    const [model, setModel] = useState("")
    const [manufacturerId, setManufacturerId] = useState("")
    const [technologyId, setTechnologyId] = useState("")
    const [buildVolumeX, setBuildVolumeX] = useState("")
    const [buildVolumeY, setBuildVolumeY] = useState("")
    const [buildVolumeZ, setBuildVolumeZ] = useState("")
    const [maxPowerConsumptionW, setMaxPowerConsumptionW] = useState("")
    const [priceUsd, setPriceUsd] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [sourceUrl, setSourceUrl] = useState("")
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!model || !manufacturerId || !technologyId || !buildVolumeX || !buildVolumeY || !buildVolumeZ) {
            alert("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            await createMarketPrinter({
                model,
                manufacturerId,
                technologyId,
                buildVolumeX: parseFloat(buildVolumeX),
                buildVolumeY: parseFloat(buildVolumeY),
                buildVolumeZ: parseFloat(buildVolumeZ),
                maxPowerConsumptionW: maxPowerConsumptionW ? parseInt(maxPowerConsumptionW) : undefined,
                priceUsd: priceUsd ? parseFloat(priceUsd) : undefined,
                imageUrl: imageUrl || undefined,
                sourceUrl: sourceUrl || undefined,
                featureIds: selectedFeatures
            })

            // Reset form
            setModel("")
            setManufacturerId("")
            setTechnologyId("")
            setBuildVolumeX("")
            setBuildVolumeY("")
            setBuildVolumeZ("")
            setMaxPowerConsumptionW("")
            setPriceUsd("")
            setImageUrl("")
            setSourceUrl("")
            setSelectedFeatures([])
            onRefresh()
        } catch (error) {
            console.error("Failed to create printer:", error)
            alert("Failed to create printer")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this printer?")) return

        try {
            await deleteMarketPrinter(id)
            onRefresh()
        } catch (error) {
            console.error("Failed to delete printer:", error)
            alert("Failed to delete printer")
        }
    }

    const toggleFeature = (featureId: string) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        )
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
                <h3 className="text-lg font-semibold text-neon-red">Create New Market Printer</h3>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Manufacturer *</label>
                        <select
                            value={manufacturerId}
                            onChange={(e) => setManufacturerId(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white cursor-pointer"
                            required
                        >
                            <option value="">Select manufacturer...</option>
                            {manufacturers.map(mfg => (
                                <option key={mfg.id} value={mfg.id}>{mfg.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Model *</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., MK4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Technology *</label>
                        <select
                            value={technologyId}
                            onChange={(e) => setTechnologyId(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white cursor-pointer"
                            required
                        >
                            <option value="">Select technology...</option>
                            {technologies.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Build Volume */}
                <div>
                    <label className="block text-sm font-medium mb-2">Build Volume (mm) *</label>
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="number"
                            step="0.1"
                            value={buildVolumeX}
                            onChange={(e) => setBuildVolumeX(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="X (width)"
                            required
                        />
                        <input
                            type="number"
                            step="0.1"
                            value={buildVolumeY}
                            onChange={(e) => setBuildVolumeY(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="Y (depth)"
                            required
                        />
                        <input
                            type="number"
                            step="0.1"
                            value={buildVolumeZ}
                            onChange={(e) => setBuildVolumeZ(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="Z (height)"
                            required
                        />
                    </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Max Power (W)</label>
                        <input
                            type="number"
                            value={maxPowerConsumptionW}
                            onChange={(e) => setMaxPowerConsumptionW(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., 250"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Price (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={priceUsd}
                            onChange={(e) => setPriceUsd(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., 999.99"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Source URL</label>
                        <input
                            type="url"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Features */}
                {features.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Features</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {features.map(feat => (
                                <label
                                    key={feat.id}
                                    className="flex items-center gap-2 p-2 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFeatures.includes(feat.id)}
                                        onChange={() => toggleFeature(feat.id)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-sm">{feat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-red hover:bg-neon-red/80 disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    {loading ? "Creating..." : "Create Printer"}
                </button>
            </form>

            {/* Existing Printers */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Market Printers</h3>
                <div className="space-y-2">
                    {printers.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No printers yet. Create one above.</p>
                    ) : (
                        printers.map((printer) => (
                            <div
                                key={printer.id}
                                className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">
                                        {printer.manufacturer.name} {printer.model}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {printer.technology.name} • Build Volume: {printer.buildVolumeX}×{printer.buildVolumeY}×{printer.buildVolumeZ}mm
                                        {printer.priceUsd && ` • $${printer.priceUsd.toFixed(2)}`}
                                    </p>
                                    {printer.features.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Features: {printer.features.map(f => f.feature.name).join(", ")}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(printer.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

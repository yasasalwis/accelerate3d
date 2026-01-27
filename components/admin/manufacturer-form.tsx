"use client"

import {useState} from "react"
import {Plus, Trash2} from "lucide-react"
import {createManufacturer, deleteManufacturer} from "@/lib/admin-actions"

interface Manufacturer {
    id: string
    name: string
    country: string | null
    website: string | null
}

interface ManufacturerFormProps {
    manufacturers: Manufacturer[]
    onRefresh: () => void
}

export function ManufacturerForm({manufacturers, onRefresh}: ManufacturerFormProps) {
    const [name, setName] = useState("")
    const [country, setCountry] = useState("")
    const [website, setWebsite] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            await createManufacturer({
                name,
                country: country || undefined,
                website: website || undefined
            })
            setName("")
            setCountry("")
            setWebsite("")
            onRefresh()
        } catch (error) {
            console.error("Failed to create manufacturer:", error)
            alert("Failed to create manufacturer")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this manufacturer?")) return

        try {
            await deleteManufacturer(id)
            onRefresh()
        } catch (error) {
            console.error("Failed to delete manufacturer:", error)
            alert("Failed to delete manufacturer")
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-neon-red">Create New Manufacturer</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., Prusa Research"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., Czech Republic"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-red hover:bg-neon-red/80 disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4"/>
                    {loading ? "Creating..." : "Create Manufacturer"}
                </button>
            </form>

            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Manufacturers</h3>
                <div className="space-y-2">
                    {manufacturers.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No manufacturers yet. Create one above.</p>
                    ) : (
                        manufacturers.map((mfg) => (
                            <div
                                key={mfg.id}
                                className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{mfg.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {mfg.country || "No country"} • {mfg.website || "No website"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(mfg.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

"use client"

import {useState} from "react"
import {Plus, Trash2} from "lucide-react"
import {createFeature, deleteFeature} from "@/lib/admin-actions"

interface Feature {
    id: string
    name: string
    description: string | null
}

interface FeatureFormProps {
    features: Feature[]
    onRefresh: () => void
}

export function FeatureForm({features, onRefresh}: FeatureFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            await createFeature({
                name,
                description: description || undefined
            })
            setName("")
            setDescription("")
            onRefresh()
        } catch (error) {
            console.error("Failed to create feature:", error)
            alert("Failed to create feature")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this feature?")) return

        try {
            await deleteFeature(id)
            onRefresh()
        } catch (error) {
            console.error("Failed to delete feature:", error)
            alert("Failed to delete feature")
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-neon-red">Create New Feature</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., Auto Bed Leveling"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="Brief description"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-red hover:bg-neon-red/80 disabled:opacity-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4"/>
                    {loading ? "Creating..." : "Create Feature"}
                </button>
            </form>

            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Features</h3>
                <div className="space-y-2">
                    {features.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No features yet. Create one above.</p>
                    ) : (
                        features.map((feat) => (
                            <div
                                key={feat.id}
                                className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{feat.name}</p>
                                    {feat.description && (
                                        <p className="text-sm text-muted-foreground">{feat.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(feat.id)}
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

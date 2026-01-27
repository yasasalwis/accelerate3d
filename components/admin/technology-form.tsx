"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { createTechnology, deleteTechnology } from "@/lib/admin-actions"

interface Technology {
    id: string
    name: string
    description: string | null
}

interface TechnologyFormProps {
    technologies: Technology[]
    onRefresh: () => void
}

export function TechnologyForm({ technologies, onRefresh }: TechnologyFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            await createTechnology({
                name,
                description: description || undefined
            })
            setName("")
            setDescription("")
            onRefresh()
        } catch (error) {
            console.error("Failed to create technology:", error)
            alert("Failed to create technology")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this technology?")) return

        try {
            await deleteTechnology(id)
            onRefresh()
        } catch (error) {
            console.error("Failed to delete technology:", error)
            alert("Failed to delete technology")
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-neon-red">Create New Technology</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:border-neon-red/50 focus:outline-none text-white"
                            placeholder="e.g., FDM, SLA, SLS"
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
                    <Plus className="w-4 h-4" />
                    {loading ? "Creating..." : "Create Technology"}
                </button>
            </form>

            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Technologies</h3>
                <div className="space-y-2">
                    {technologies.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No technologies yet. Create one above.</p>
                    ) : (
                        technologies.map((tech) => (
                            <div
                                key={tech.id}
                                className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{tech.name}</p>
                                    {tech.description && (
                                        <p className="text-sm text-muted-foreground">{tech.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(tech.id)}
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

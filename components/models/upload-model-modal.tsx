"use client"

import * as React from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadModelModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function UploadModelModal({ isOpen, onClose, onSuccess }: UploadModelModalProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [file, setFile] = React.useState<File | null>(null)
    const [formData, setFormData] = React.useState({
        name: "",
        width: "",
        depth: "",
        height: "",
        estimatedTime: "",
        filamentGrams: "",
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            if (!formData.name) {
                setFormData(prev => ({ ...prev, name: selectedFile.name.replace(/\.[^/.]+$/, "") }))
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setIsUploading(true)
        const data = new FormData()
        data.append("file", file)
        data.append("name", formData.name)
        data.append("width", formData.width)
        data.append("depth", formData.depth)
        data.append("height", formData.height)
        data.append("estimatedTime", formData.estimatedTime)
        data.append("filamentGrams", formData.filamentGrams)

        try {
            const response = await fetch("/api/models/upload", {
                method: "POST",
                body: data,
            })

            if (response.ok) {
                onSuccess()
                onClose()
                // Reset form
                setFile(null)
                setFormData({
                    name: "",
                    width: "",
                    depth: "",
                    height: "",
                    estimatedTime: "",
                    filamentGrams: "",
                })
            } else {
                const error = await response.json()
                alert(`Upload failed: ${error.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed. Please check your connection.")
        } finally {
            setIsUploading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-rajdhani uppercase tracking-tight text-white">Upload G-CODE</h2>
                        <p className="text-xs text-zinc-500 font-mono">Add a new G-code file to your library.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".gcode"
                                onChange={handleFileChange}
                                required
                            />
                            <div className="size-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                                <Upload className="size-6 text-zinc-400" />
                            </div>
                            <p className="text-sm font-medium text-white">
                                {file ? file.name : "Click to select or drag & drop"}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tighter">G-code file</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Model Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                placeholder="Display Name"
                                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Width (mm)</label>
                                <input
                                    type="number"
                                    value={formData.width}
                                    onChange={(e) => setFormData(p => ({ ...p, width: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Depth (mm)</label>
                                <input
                                    type="number"
                                    value={formData.depth}
                                    onChange={(e) => setFormData(p => ({ ...p, depth: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Height (mm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData(p => ({ ...p, height: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Est. Time (s)</label>
                                <input
                                    type="number"
                                    value={formData.estimatedTime}
                                    onChange={(e) => setFormData(p => ({ ...p, estimatedTime: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                    placeholder="3600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-zinc-500 ml-1">Filament (g)</label>
                                <input
                                    type="number"
                                    value={formData.filamentGrams}
                                    onChange={(e) => setFormData(p => ({ ...p, filamentGrams: e.target.value }))}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-red/50 transition-all"
                                    placeholder="150"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 border border-white/10 text-zinc-400 hover:text-white"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="premium"
                            className="flex-1"
                            disabled={!file || isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="size-4 mr-2" />
                            )}
                            {isUploading ? "Uploading..." : "Start Upload"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

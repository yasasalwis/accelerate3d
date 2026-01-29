"use client"

import {useEffect, useState} from "react"
import {AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, Loader2, Settings2} from "lucide-react"
import {Button} from "@/components/ui/button"
import {sliceFile} from "@/lib/slicer-actions"

interface SlicerProfile {
    name: string
    path: string
}

interface SlicerProfilesResponse {
    prusa: SlicerProfile[]
    orca: SlicerProfile[]
    bambu: SlicerProfile[]
}

interface ProfileDefaults {
    supports: boolean
    supportType: string
    brim: boolean
    brimWidth: number
    infill: string
    infillPattern: string
}

export default function SliceTab() {
    const [file, setFile] = useState<File | null>(null)
    const [slicer, setSlicer] = useState<"prusa" | "orca" | "bambu">("prusa")
    const [profiles, setProfiles] = useState<SlicerProfilesResponse>({prusa: [], orca: [], bambu: []})
    const [selectedProfile, setSelectedProfile] = useState<string>("")
    const [status, setStatus] = useState<"idle" | "uploading" | "slicing" | "done" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [gcodeUrl, setGcodeUrl] = useState<string | null>(null)
    const [gcodeFilename, setGcodeFilename] = useState<string | null>(null)

    // Advanced Settings State
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [defaults, setDefaults] = useState<ProfileDefaults | null>(null)
    const [formState, setFormState] = useState<ProfileDefaults>({
        supports: false,
        supportType: "grid",
        brim: false,
        brimWidth: 5,
        infill: "15%",
        infillPattern: "grid"
    })
    const [loadingDefaults, setLoadingDefaults] = useState(false)

    // Fetch profiles on mount
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await fetch("/api/slicer/profiles")
                if (res.ok) {
                    const data = await res.json()
                    setProfiles(data)
                    // Auto-select first profile if available
                    if (data.prusa.length > 0) {
                        setSelectedProfile(data.prusa[0].path)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profiles", err)
            }
        }
        fetchProfiles()
    }, [])

    // Update selected profile when slicer changes
    useEffect(() => {
        const available = profiles[slicer]
        if (available.length > 0) {
            // Try to keep selection if valid, else pick first
            const exists = available.find(p => p.path === selectedProfile)
            if (!exists) {
                setSelectedProfile(available[0].path)
            }
        } else {
            setSelectedProfile("")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slicer, profiles])

    // Fetch profile details (defaults) when profile changes
    useEffect(() => {
        if (!selectedProfile) return

        const fetchDefaults = async () => {
            setLoadingDefaults(true)
            try {
                const params = new URLSearchParams({
                    path: selectedProfile,
                    type: slicer
                })
                const res = await fetch(`/api/slicer/profile-details?${params}`)
                if (res.ok) {
                    const data = await res.json()
                    setDefaults(data)
                    setFormState(data) // Reset form to new defaults
                }
            } catch (err) {
                console.error("Failed to fetch profile defaults", err)
            } finally {
                setLoadingDefaults(false)
            }
        }

        fetchDefaults()
    }, [selectedProfile, slicer])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus("idle")
            setErrorMessage(null)
            setGcodeUrl(null)
        }
    }

    const handleSlice = async () => {
        if (!file || !selectedProfile) return

        setStatus("uploading")
        setErrorMessage(null)

        // Smart Overrides: Compare formState with defaults
        const overrides: Partial<ProfileDefaults> = {}
        if (defaults) {
            if (formState.supports !== defaults.supports) overrides.supports = formState.supports
            if (formState.supports && formState.supportType !== defaults.supportType) overrides.supportType = formState.supportType
            if (formState.brim !== defaults.brim) overrides.brim = formState.brim
            if (formState.brim && formState.brimWidth !== defaults.brimWidth) overrides.brimWidth = formState.brimWidth
            if (formState.infill !== defaults.infill) overrides.infill = formState.infill
            if (formState.infillPattern !== defaults.infillPattern) overrides.infillPattern = formState.infillPattern
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("slicerType", slicer)
        formData.append("profilePath", selectedProfile)
        // Send empty object if no overrides, but backend handles that
        formData.append("overrides", JSON.stringify(overrides))

        try {
            setStatus("slicing")
            const result = await sliceFile(null, formData)

            if (result.error) {
                setStatus("error")
                setErrorMessage(result.error)
            } else if (result.success && result.gcodeUrl) {
                setStatus("done")
                setGcodeUrl(result.gcodeUrl)
                setGcodeFilename(result.filename || "model.gcode")
            }
        } catch {
            setStatus("error")
            setErrorMessage("An unexpected error occurred.")
        }
    }

    return (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-8 w-full max-w-2xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">New Slice Job</h2>
                <p className="text-zinc-400 text-sm">Upload an STL model and select a profile to generate G-code.</p>
            </div>

            <div className="space-y-6">
                {/* File Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Model File (.stl)</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".stl"
                            onChange={handleFileChange}
                            className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer border border-zinc-700 rounded-lg p-2 bg-zinc-950/50"
                        />
                        {file && (
                            <div className="absolute right-3 top-2.5 text-emerald-400">
                                <CheckCircle className="w-5 h-5"/>
                            </div>
                        )}
                    </div>
                </div>

                {/* Slicer Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Slicer Engine</label>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setSlicer("prusa")}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${slicer === "prusa"
                                ? "bg-orange-600/20 border-orange-500 text-orange-200"
                                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            }`}
                        >
                            PrusaSlicer
                        </button>
                        <button
                            onClick={() => setSlicer("orca")}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${slicer === "orca"
                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-200"
                                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            }`}
                        >
                            OrcaSlicer
                        </button>
                        <button
                            onClick={() => setSlicer("bambu")}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${slicer === "bambu"
                                ? "bg-green-600/20 border-green-500 text-green-200"
                                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            }`}
                        >
                            BambuLab
                        </button>
                    </div>
                </div>

                {/* Profile Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Print Profile</label>
                    <select
                        value={selectedProfile}
                        onChange={(e) => setSelectedProfile(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg p-2.5 text-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {profiles[slicer].length === 0 ? (
                            <option value="">No profiles found</option>
                        ) : (
                            profiles[slicer].map((profile) => (
                                <option key={profile.path} value={profile.path}>
                                    {profile.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Advanced Settings */}
                <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                            <Settings2 className="w-4 h-4"/>
                            <span>Advanced Settings</span>
                        </div>
                        {showAdvanced ? <ChevronUp className="w-4 h-4 text-zinc-400"/> :
                            <ChevronDown className="w-4 h-4 text-zinc-400"/>}
                    </button>

                    {showAdvanced && (
                        <div className="p-4 bg-zinc-900/30 space-y-4 border-t border-zinc-700/50">
                            {loadingDefaults ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-zinc-500"/>
                                </div>
                            ) : (
                                <>
                                    {/* Supports */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-zinc-300">Supports</span>
                                            <div
                                                onClick={() => setFormState(s => ({...s, supports: !s.supports}))}
                                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formState.supports ? "bg-blue-600" : "bg-zinc-700"}`}
                                            >
                                                <div
                                                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${formState.supports ? "left-6" : "left-1"}`}/>
                                            </div>
                                        </div>
                                        {formState.supports && (
                                            <div className="pl-4 border-l-2 border-zinc-700 mt-2">
                                                <label className="text-xs text-zinc-500 block mb-1">Type</label>
                                                <select
                                                    value={formState.supportType}
                                                    onChange={(e) => setFormState(s => ({
                                                        ...s,
                                                        supportType: e.target.value
                                                    }))}
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200"
                                                >
                                                    <option value="grid">Grid</option>
                                                    <option value="organic">Tree / Organic</option>
                                                    <option value="snug">Snug</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Brim */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-zinc-300">Brim</span>
                                            <div
                                                onClick={() => setFormState(s => ({...s, brim: !s.brim}))}
                                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formState.brim ? "bg-blue-600" : "bg-zinc-700"}`}
                                            >
                                                <div
                                                    className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${formState.brim ? "left-6" : "left-1"}`}/>
                                            </div>
                                        </div>
                                        {formState.brim && (
                                            <div className="pl-4 border-l-2 border-zinc-700 mt-2">
                                                <label className="text-xs text-zinc-500 block mb-1">Width (mm)</label>
                                                <input
                                                    type="number"
                                                    value={formState.brimWidth}
                                                    onChange={(e) => setFormState(s => ({
                                                        ...s,
                                                        brimWidth: Number(e.target.value)
                                                    }))}
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Infill */}
                                    <div className="space-y-2">
                                        <span className="text-sm text-zinc-300 block">Infill</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-zinc-500 block mb-1">Density</label>
                                                <select
                                                    value={formState.infill}
                                                    onChange={(e) => setFormState(s => ({
                                                        ...s,
                                                        infill: e.target.value
                                                    }))}
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200"
                                                >
                                                    <option value="0%">0%</option>
                                                    <option value="15%">15%</option>
                                                    <option value="20%">20%</option>
                                                    <option value="100%">100%</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500 block mb-1">Pattern</label>
                                                <select
                                                    value={formState.infillPattern}
                                                    onChange={(e) => setFormState(s => ({
                                                        ...s,
                                                        infillPattern: e.target.value
                                                    }))}
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200"
                                                >
                                                    <option value="grid">Grid</option>
                                                    <option value="gyroid">Gyroid</option>
                                                    <option value="rectilinear">Rectilinear</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="pt-4">
                    {status === "idle" || status === "error" ? (
                        <div className="space-y-4">
                            {status === "error" && errorMessage && (
                                <div
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4"/>
                                    {errorMessage}
                                </div>
                            )}
                            <Button
                                onClick={handleSlice}
                                disabled={!file || !selectedProfile}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                Slice Model
                            </Button>
                        </div>
                    ) : status === "done" ? (
                        <div className="space-y-4">
                            <div
                                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                                <CheckCircle className="w-5 h-5 flex-shrink-0"/>
                                <div className="flex-1">
                                    <p className="font-medium">Slicing Completed & Added to Models!</p>
                                    <p className="text-xs opacity-80">{gcodeFilename}</p>
                                </div>
                            </div>
                            <a
                                href={gcodeUrl!}
                                download={gcodeFilename}
                                className="inline-flex items-center justify-center w-full gap-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-2.5 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4"/>
                                Download G-Code
                            </a>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setStatus("idle")
                                    setFile(null)
                                    setGcodeUrl(null)
                                }}
                                className="w-full text-zinc-400 hover:text-white"
                            >
                                Slice Another File
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="p-8 border border-zinc-800 rounded-lg bg-zinc-900/50 flex flex-col items-center justify-center gap-4 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
                            <div className="space-y-1">
                                <p className="font-medium text-zinc-200">
                                    {status === "uploading" ? "Uploading Model..." : "Slicing Model..."}
                                </p>
                                <p className="text-xs text-zinc-500">This may take a moment depending on complexity.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

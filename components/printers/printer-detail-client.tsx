"use client"

import {useCallback, useEffect, useState} from "react"
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    CircleDashed,
    Pause,
    Play,
    RotateCcw,
    Thermometer,
    WifiOff,
    X
} from "lucide-react"
import {cn} from "@/lib/utils"

interface PrinterStatus {
    id: string
    name: string
    ipAddress: string
    protocol: string
    webcamUrl?: string | null
    status: "IDLE" | "PRINTING" | "PAUSED" | "ERROR" | "OFFLINE"
    temps: { nozzle: number; bed: number }
    progress: number
    timeLeft?: string
    filename?: string
    activeJobId?: string
}

interface PrinterDetailClientProps {
    printerId: string
    initialData: {
        name: string
        ipAddress: string
        protocol: string
        webcamUrl?: string | null
    }
}

export default function PrinterDetailClient({printerId, initialData}: PrinterDetailClientProps) {
    const [status, setStatus] = useState<PrinterStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/printers/${printerId}/status`)
            if (!res.ok) throw new Error("Failed to fetch status")
            const data = await res.json()
            setStatus(data)
            setError(null)
        } catch {
            setError("Unable to connect to printer")
        } finally {
            setLoading(false)
        }
    }, [printerId])

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 5000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    const sendCommand = async (action: "pause" | "resume" | "cancel") => {
        setActionLoading(action)
        try {
            const res = await fetch(`/api/printers/${printerId}/control`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action})
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Command failed")
            }
            await fetchStatus()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Command failed")
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case "PRINTING":
                return "text-neon-lime"
            case "PAUSED":
                return "text-yellow-400"
            case "ERROR":
                return "text-neon-red"
            case "OFFLINE":
                return "text-zinc-500"
            default:
                return "text-neon-cyan"
        }
    }

    const getStatusIcon = (s: string) => {
        switch (s) {
            case "PRINTING":
                return <CircleDashed className="size-5 animate-spin"/>
            case "PAUSED":
                return <Pause className="size-5"/>
            case "ERROR":
                return <AlertCircle className="size-5"/>
            case "OFFLINE":
                return <WifiOff className="size-5"/>
            default:
                return <CheckCircle2 className="size-5"/>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-zinc-400">
                    <RotateCcw className="size-5 animate-spin"/>
                    <span>Connecting to printer...</span>
                </div>
            </div>
        )
    }

    const displayStatus = status?.status || "OFFLINE"
    const displayName = status?.name || initialData.name

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={cn("p-3 rounded-xl bg-zinc-900 border border-zinc-800", getStatusColor(displayStatus))}>
                        {getStatusIcon(displayStatus)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{displayName}</h1>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>{initialData.ipAddress}</span>
                            {initialData.protocol && initialData.protocol !== "UNKNOWN" && (
                                <span
                                    className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs">{initialData.protocol}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={cn("px-4 py-2 rounded-lg border font-semibold uppercase text-sm",
                    displayStatus === "PRINTING" && "bg-neon-lime/10 border-neon-lime/30 text-neon-lime",
                    displayStatus === "PAUSED" && "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
                    displayStatus === "ERROR" && "bg-neon-red/10 border-neon-red/30 text-neon-red",
                    displayStatus === "OFFLINE" && "bg-zinc-800 border-zinc-700 text-zinc-500",
                    displayStatus === "IDLE" && "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan"
                )}>
                    {displayStatus}
                </div>
            </div>

            {error && (
                <div
                    className="p-4 rounded-xl bg-neon-red/10 border border-neon-red/30 text-neon-red flex items-center gap-3">
                    <AlertCircle className="size-5"/>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webcam Feed */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="font-semibold text-white">Live Feed</h2>
                    </div>
                    <div className="aspect-video bg-black flex items-center justify-center">
                        {status?.webcamUrl && displayStatus !== "OFFLINE" ? (
                            <div className="relative w-full h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={status.webcamUrl}
                                    alt="Live webcam feed"
                                    className="w-full h-full object-contain"
                                />
                                <div
                                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-red-500/80 rounded-md animate-pulse">
                                    <div className="size-1.5 rounded-full bg-white"/>
                                    <span className="text-[10px] font-bold text-white uppercase">Live</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-600 flex flex-col items-center gap-2">
                                <WifiOff className="size-8"/>
                                <span className="text-sm">No video feed available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Panel */}
                <div className="space-y-6">
                    {/* Temperature Gauges */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                        <h2 className="font-semibold text-white mb-4">Temperatures</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                                <div className="flex items-center gap-2 text-orange-400 mb-2">
                                    <Thermometer className="size-4"/>
                                    <span className="text-xs uppercase font-medium">Nozzle</span>
                                </div>
                                <div className="text-3xl font-bold text-white font-mono">
                                    {status?.temps.nozzle || 0}°C
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Thermometer className="size-4"/>
                                    <span className="text-xs uppercase font-medium">Bed</span>
                                </div>
                                <div className="text-3xl font-bold text-white font-mono">
                                    {status?.temps.bed || 0}°C
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print Progress */}
                    {(displayStatus === "PRINTING" || displayStatus === "PAUSED") && (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h2 className="font-semibold text-white mb-4">Current Print</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-zinc-400 truncate max-w-[70%]">
                                        {status?.filename || "Unknown file"}
                                    </span>
                                    <span className="text-neon-lime font-bold">{status?.progress || 0}%</span>
                                </div>
                                <div
                                    className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                                    <div
                                        className="h-full bg-neon-lime transition-all duration-1000 rounded-full relative"
                                        style={{width: `${status?.progress || 0}%`}}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"/>
                                    </div>
                                </div>
                                {status?.timeLeft && (
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Activity className="size-4"/>
                                        <span>{status.timeLeft} remaining</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Control Panel */}
                    {displayStatus !== "OFFLINE" && (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                            <h2 className="font-semibold text-white mb-4">Controls</h2>
                            <div className="flex gap-3">
                                {displayStatus === "PRINTING" && (
                                    <button
                                        onClick={() => sendCommand("pause")}
                                        disabled={actionLoading !== null}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "pause" ? (
                                            <RotateCcw className="size-4 animate-spin"/>
                                        ) : (
                                            <Pause className="size-4"/>
                                        )}
                                        <span className="font-semibold">Pause</span>
                                    </button>
                                )}
                                {displayStatus === "PAUSED" && (
                                    <button
                                        onClick={() => sendCommand("resume")}
                                        disabled={actionLoading !== null}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-lime/10 border border-neon-lime/30 text-neon-lime hover:bg-neon-lime/20 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "resume" ? (
                                            <RotateCcw className="size-4 animate-spin"/>
                                        ) : (
                                            <Play className="size-4"/>
                                        )}
                                        <span className="font-semibold">Resume</span>
                                    </button>
                                )}
                                {(displayStatus === "PRINTING" || displayStatus === "PAUSED") && (
                                    <button
                                        onClick={() => sendCommand("cancel")}
                                        disabled={actionLoading !== null}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-red/10 border border-neon-red/30 text-neon-red hover:bg-neon-red/20 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === "cancel" ? (
                                            <RotateCcw className="size-4 animate-spin"/>
                                        ) : (
                                            <X className="size-4"/>
                                        )}
                                        <span className="font-semibold">Cancel</span>
                                    </button>
                                )}
                                {displayStatus === "IDLE" && (
                                    <div
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-500">
                                        <CheckCircle2 className="size-4"/>
                                        <span className="font-semibold">Printer Ready</span>
                                    </div>
                                )}
                                {displayStatus === "ERROR" && (
                                    <div
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-red/10 border border-neon-red/30 text-neon-red">
                                        <AlertCircle className="size-4"/>
                                        <span className="font-semibold">Check Printer</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

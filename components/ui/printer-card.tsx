import {BadgeAlert, CheckCircle2, CircleDashed, Settings, Thermometer, Trash2, WifiOff} from "lucide-react"
import {cn} from "@/lib/utils"
import Image from "next/image"

export type PrinterStatus = "IDLE" | "PRINTING" | "ERROR" | "OFFLINE"

interface PrinterCardProps {
    id: string
    name: string
    status: PrinterStatus
    progress?: number
    timeLeft?: string
    temps?: { nozzle: number; bed: number }
    file?: string
    imageUrl?: string
    ipAddress: string
    webcamUrl?: string | null
    protocol?: string
    lastSeen?: Date | null
    onEdit: (id: string) => void
    onRemove: (id: string) => void
}

export function PrinterCard({
                                id,
                                name,
                                status,
                                progress = 0,
                                timeLeft,
                                temps,
                                file,
                                imageUrl,
                                ipAddress,
                                webcamUrl,
                                protocol,
                                lastSeen,
                                onEdit,
                                onRemove
                            }: PrinterCardProps) {
    const getStatusColor = (s: PrinterStatus) => {
        switch (s) {
            case "PRINTING":
                return "text-neon-lime border-neon-lime/50 bg-black/60 backdrop-blur-md"
            case "ERROR":
                return "text-neon-red border-neon-red/50 bg-black/60 backdrop-blur-md animate-pulse"
            case "OFFLINE":
                return "text-zinc-400 border-zinc-700 bg-black/60 backdrop-blur-md"
            default:
                return "text-neon-cyan border-neon-cyan/50 bg-black/60 backdrop-blur-md"
        }
    }

    const getStatusGlow = (s: PrinterStatus) => {
        switch (s) {
            case "PRINTING":
                return "group-hover:ring-1 group-hover:ring-neon-lime/50"
            case "ERROR":
                return "ring-1 ring-neon-red/50"
            case "IDLE":
                return "group-hover:ring-1 group-hover:ring-neon-cyan/50"
            default:
                return ""
        }
    }

    const handleClick = () => {
        if (status !== "OFFLINE") {
            window.open(`http://${ipAddress}`, '_blank')
        }
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 transition-all duration-300 h-[320px] flex flex-col justify-between",
                status !== "OFFLINE" && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50",
                getStatusGlow(status)
            )}
        >
            {/* Background Image or Video Stream */}
            <div className="absolute inset-0 z-0">
                {status !== "OFFLINE" && webcamUrl ? (
                    /* Live Video Stream */
                    <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={webcamUrl}
                            alt={`${name} Live Feed`}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform scale-105 group-hover:scale-110"
                            // Add error handling to fallback to static image if stream fails?
                            // For simplicity, we just try to load it. If it fails, browser shows broken image icon or nothing.
                            // Ideally we'd have an onError handler to switch back to imageUrl.
                        />
                        {/* Live Indicator */}
                        <div className="absolute top-4 right-14 z-20 pointer-events-none">
                            <div
                                className="flex items-center gap-1.5 px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded-md border border-red-400/50 shadow-lg animate-pulse">
                                <div className="size-1.5 rounded-full bg-white"/>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    </div>
                ) : imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 scale-105 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center">
                        <CheckCircle2 className="size-20 text-white/5"/>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"/>
            </div>

            {/* Actions (Top Right) */}
            <div
                className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(id)
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-white/10 hover:bg-neon-purple hover:border-neon-purple/50 text-white transition-all backdrop-blur-md"
                >
                    <Settings className="size-4"/>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove(id)
                    }}
                    className="p-2 rounded-lg bg-black/60 border border-white/10 hover:bg-neon-red hover:border-neon-red/50 text-white transition-all backdrop-blur-md"
                >
                    <Trash2 className="size-4"/>
                </button>
            </div>

            {/* Status Badge (Top Left) */}
            <div className="absolute top-4 left-4 z-20">
                <div
                    className={cn("px-3 py-1.5 rounded-full text-xs font-bold border uppercase flex items-center gap-2 shadow-lg", getStatusColor(status))}>
                    {status === "PRINTING" && <CircleDashed className="size-3.5 animate-spin"/>}
                    {status === "ERROR" && <BadgeAlert className="size-3.5"/>}
                    {status === "IDLE" && <CheckCircle2 className="size-3.5"/>}
                    {status === "OFFLINE" ? "UNAVAILABLE" : status}
                </div>
            </div>

            {/* Content (Bottom) */}
            <div className="relative z-10 p-6 mt-auto">
                <h3 className="font-bold text-2xl tracking-tight text-white mb-4 shadow-black drop-shadow-lg font-rajdhani uppercase">{name}</h3>

                {status === "PRINTING" ? (
                    <div className="space-y-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs text-zinc-300 font-mono items-center">
                            <span
                                className="truncate max-w-[150px] font-bold text-white">{file || "Unknown Model"}</span>
                            <span className="text-neon-lime">{progress}%</span>
                        </div>

                        <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-neon-lime transition-all duration-1000 ease-linear rounded-full relative overflow-hidden shadow-[0_0_10px_var(--neon-lime)]"
                                style={{width: `${progress}%`}}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"/>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <div className="flex gap-3 text-xs">
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Thermometer className="size-3 text-orange-400"/>
                                    <span className="font-mono text-zinc-200">{temps?.nozzle}°</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Thermometer className="size-3 text-blue-400"/>
                                    <span className="font-mono text-zinc-200">{temps?.bed}°</span>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-zinc-400">
                                {timeLeft} left
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 text-sm text-zinc-400/80 font-medium">
                            {status === "OFFLINE" ? (
                                <WifiOff className="size-4"/>
                            ) : (
                                <div className="size-2 rounded-full bg-neon-cyan shadow-[0_0_10px_var(--neon-cyan)]"/>
                            )}
                            {status === "OFFLINE" ? "Check connection" : "System Ready"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
                            {protocol && protocol !== "UNKNOWN" && (
                                <span
                                    className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">{protocol}</span>
                            )}
                            {lastSeen && (
                                <span>Seen {new Date(lastSeen).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

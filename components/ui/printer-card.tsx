import { BadgeAlert, CheckCircle2, CircleDashed, Thermometer, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type PrinterStatus = "IDLE" | "PRINTING" | "ERROR" | "OFFLINE"

interface PrinterCardProps {
    name: string
    status: PrinterStatus
    progress?: number
    timeLeft?: string
    temps?: { nozzle: number; bed: number }
    file?: string
}

export function PrinterCard({ name, status, progress = 0, timeLeft, temps, file }: PrinterCardProps) {
    const getStatusColor = (s: PrinterStatus) => {
        switch (s) {
            case "PRINTING": return "text-neon-lime border-neon-lime/50 bg-neon-lime/10"
            case "ERROR": return "text-neon-red border-neon-red/50 bg-neon-red/10 animate-pulse"
            case "OFFLINE": return "text-muted-foreground border-muted-foreground/50 bg-muted/10"
            default: return "text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10"
        }
    }

    const getStatusGlow = (s: PrinterStatus) => {
        switch (s) {
            case "PRINTING": return "glow-lime ring-1 ring-neon-lime/30"
            case "ERROR": return "glow-red ring-1 ring-neon-red/50"
            case "IDLE": return "hover:glow-cyan hover:ring-1 hover:ring-neon-cyan/30"
            default: return ""
        }
    }

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl bg-zinc-900/40 p-5 transition-all duration-300 hover:bg-zinc-900/60",
            "glass",
            status === "ERROR" && "bg-destructive/5",
            getStatusGlow(status)
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold tracking-tight text-lg group-hover:text-white transition-colors uppercase font-rajdhani">{name}</h3>
                <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase flex items-center gap-1.5", getStatusColor(status))}>
                    {status === "PRINTING" && <CircleDashed className="size-3 animate-spin" />}
                    {status === "ERROR" && <BadgeAlert className="size-3" />}
                    {status === "IDLE" && <CheckCircle2 className="size-3" />}
                    {status}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {status === "PRINTING" ? (
                    <>
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                <span className="truncate max-w-[120px]">{file || "Unknown Model"}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-neon-lime transition-all duration-1000 ease-linear rounded-full relative overflow-hidden shadow-[0_0_10px_var(--neon-lime)]"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                </div>
                            </div>
                            <div className="text-right text-xs font-mono text-muted-foreground">
                                {timeLeft} remaining
                            </div>
                        </div>

                        {/* Temps */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/20 p-2 rounded-lg border border-white/5">
                                <Thermometer className="size-3.5 text-orange-400" />
                                <span>Noz: <span className="text-foreground font-mono">{temps?.nozzle}°C</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-black/20 p-2 rounded-lg border border-white/5">
                                <Thermometer className="size-3.5 text-blue-400" />
                                <span>Bed: <span className="text-foreground font-mono">{temps?.bed}°C</span></span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-24 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                        <PrinterCard.IdleIcon status={status} />
                        <span className="text-sm font-medium">{status === "OFFLINE" ? "Printer Disconnected" : "Ready to Print"}</span>
                    </div>
                )}
            </div>

            {/* Decorative Gradient Blob */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-white/10 transition-all duration-500" />
        </div>
    )
}

PrinterCard.IdleIcon = ({ status }: { status: PrinterStatus }) => {
    if (status === "OFFLINE") return <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center"><WifiOff className="size-5" /></div>
    return <div className="size-10 rounded-full bg-neon-cyan/5 flex items-center justify-center border border-neon-cyan/10 group-hover:border-neon-cyan/30 transition-all"><CheckCircle2 className="size-5 text-neon-cyan/40 group-hover:text-neon-cyan transition-all" /></div>
}

import { Box, FileCode, Clock, Weight, Maximize2, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelCardProps {
    name: string
    thumbnailUrl?: string | null
    dimensions: { width: number; depth: number; height: number }
    estimatedTime: number
    filamentGrams: number
    material?: string | null
    onPrint?: () => void
}

// Material type color mapping
const getMaterialColor = (material: string | null | undefined) => {
    if (!material) return { bg: "bg-zinc-800/50", text: "text-zinc-400", border: "border-zinc-700", label: "UNKNOWN" }

    const mat = material.toUpperCase()
    if (mat.includes('PLA')) return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30", label: "PLA" }
    if (mat.includes('ABS')) return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", label: "ABS" }
    if (mat.includes('PETG')) return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", label: "PETG" }
    if (mat.includes('TPU')) return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", label: "TPU" }
    if (mat.includes('NYLON') || mat.includes('PA')) return { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", label: "NYLON" }
    if (mat.includes('ASA')) return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", label: "ASA" }

    return { bg: "bg-zinc-800/50", text: "text-zinc-400", border: "border-zinc-700", label: mat.substring(0, 6) }
}

export function ModelCard({
    name,
    thumbnailUrl,
    dimensions,
    estimatedTime,
    filamentGrams,
    material,
    onPrint
}: ModelCardProps) {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return `${h}h ${m}m`
    }

    const materialStyle = getMaterialColor(material)

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-900/60",
            "glass ring-1 ring-white/5 hover:ring-neon-red/30 hover:glow-red"
        )}>
            {/* Thumbnail */}
            <div className="relative aspect-video w-full rounded-lg bg-black/40 overflow-hidden mb-4 border border-white/5">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Box className="size-12" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                        {dimensions.width}x{dimensions.depth}x{dimensions.height} mm
                    </span>
                    <div className="flex gap-1.5">
                        <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border", materialStyle.bg, materialStyle.text, materialStyle.border)}>
                            {materialStyle.label}
                        </span>
                        <span className="text-[10px] font-mono text-neon-lime bg-neon-lime/10 px-1.5 py-0.5 rounded border border-neon-lime/20">
                            {filamentGrams}g
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold tracking-tight text-white uppercase font-rajdhani truncate max-w-[140px]">{name}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                            {material ? `${materialStyle.label} • GCODE` : "GCODE"}
                        </p>
                    </div>
                    <button
                        onClick={() => console.log('Maximize view')}
                        className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-neon-red transition-colors group/btn cursor-pointer"
                    >
                        <Maximize2 className="size-4 text-zinc-400 group-hover/btn:text-white" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-md border border-white/5">
                        <Clock className="size-3 text-zinc-500" />
                        <span>{formatTime(estimatedTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-md border border-white/5">
                        <FileCode className="size-3 text-zinc-500" />
                        <span>SLICED</span>
                    </div>
                </div>

                <button
                    onClick={onPrint}
                    className="w-full py-2 bg-gradient-to-r from-neon-red to-neon-red/80 text-white rounded-lg text-xs font-bold uppercase tracking-widest font-rajdhani hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all active:scale-[0.98] cursor-pointer"
                >
                    Add to Queue
                </button>
            </div>
        </div>
    )
}

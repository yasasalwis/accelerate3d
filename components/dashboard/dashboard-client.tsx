"use client"

import {PrinterCard, PrinterStatus} from "@/components/ui/printer-card"
import {Activity, Layers, Zap} from "lucide-react"
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts"
import {cn} from "@/lib/utils"

export type IconKey = "Activity" | "Zap" | "Layers"

export interface MetricStat {
    title: string
    value: string
    icon: IconKey
    change: string
    sub: string
    color: "neon-cyan" | "neon-lime" | "neon-red"
}

export interface PrinterData {
    id: string
    name: string
    status: PrinterStatus
    progress?: number
    timeLeft?: string
    temps?: { nozzle: number; bed: number }
    file?: string
    ipAddress: string
}

export interface FleetData {
    name: string
    value: number
    color: string
}

interface DashboardClientProps {
    printers: PrinterData[]
    stats: MetricStat[]
    fleetData: FleetData[]
    activePercentage: number
}

const iconMap = {
    Activity: Activity,
    Zap: Zap,
    Layers: Layers
}

export default function DashboardClient({printers, stats, fleetData, activePercentage}: DashboardClientProps) {
    const handleEdit = (id: string) => {
        console.log("Edit printer:", id)
    }

    const handleRemove = (id: string) => {
        console.log("Remove printer:", id)
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/* 1. Hero & Stats Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[300px]">

                {/* Fleet Status (Large Card) - Spans 4 columns */}
                <div
                    className="xl:col-span-4 glass-card rounded-xl border border-white/5 p-6 flex flex-col relative overflow-hidden group">
                    {/* Background Radial Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none"/>

                    <div className="flex justify-between items-start z-10">
                        <div>
                            <h2 className="text-xl font-bold font-rajdhani text-foreground tracking-tight uppercase">Fleet
                                Status</h2>
                            <p className="text-sm text-zinc-500">Real-time Telemetry</p>
                        </div>
                        <div
                            className="size-8 rounded-full bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20 animate-pulse">
                            <Activity className="size-5 text-neon-cyan"/>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-4 mt-2">
                        {/* Donut Chart */}
                        <div className="relative size-[180px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fleetData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {fleetData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color}
                                                  className="stroke-transparent"/>
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            borderColor: '#27272a',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{color: '#fff'}}
                                        formatter={(value: number | undefined) => [value, 'Printers']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Ring Text */}
                            <div
                                className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span
                                    className="text-5xl font-bold font-rajdhani tracking-tighter text-white text-glow">{activePercentage}%</span>
                                <span
                                    className="text-[10px] uppercase text-neon-lime tracking-widest font-semibold">Active</span>
                            </div>
                        </div>

                        {/* Legend / Breakdown */}
                        <div className="flex-1 space-y-3">
                            {fleetData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                                boxShadow: `0 0 8px ${item.color}`
                                            }}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-mono text-foreground font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid - Spans 8 columns */}
                <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {stats.map((stat) => {
                        const Icon = iconMap[stat.icon]
                        return (
                            <div key={stat.title} className={cn(
                                "glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden",
                                stat.color === 'neon-red' && "hover:border-neon-red/50 hover:bg-neon-red/5",
                                stat.color === 'neon-lime' && "hover:border-neon-lime/50 hover:bg-neon-lime/5",
                                stat.color === 'neon-cyan' && "hover:border-neon-cyan/50 hover:bg-neon-cyan/5"
                            )}>
                                {/* Hover Glow */}
                                <div className={cn(
                                    "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
                                    stat.color === 'neon-red' && "via-neon-red",
                                    stat.color === 'neon-lime' && "via-neon-lime",
                                    stat.color === 'neon-cyan' && "via-neon-cyan"
                                )}/>

                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-3 rounded-lg bg-white/5 text-zinc-400 transition-colors",
                                        stat.color === 'neon-red' && "group-hover:text-neon-red group-hover:bg-neon-red/10",
                                        stat.color === 'neon-lime' && "group-hover:text-neon-lime group-hover:bg-neon-lime/10",
                                        stat.color === 'neon-cyan' && "group-hover:text-neon-cyan group-hover:bg-neon-cyan/10"
                                    )}>
                                        <Icon className="size-6"/>
                                    </div>
                                    <span
                                        className="text-xs font-rajdhani font-bold text-zinc-500 uppercase tracking-widest">{stat.sub}</span>
                                </div>

                                <div>
                                    <span
                                        className="text-4xl font-bold font-rajdhani tracking-tighter block text-foreground mt-4">{stat.value}</span>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-zinc-400 font-medium">{stat.title}</span>
                                        <span
                                            className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>

            {/* 2. Live Feed (Bento Grid) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold font-rajdhani tracking-tight flex items-center gap-3 text-foreground uppercase">
                        <span className="relative flex h-3 w-3">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-lime"></span>
                        </span>
                        Live Operations
                    </h2>
                    <div className="flex gap-2">
                        <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => console.log('Grid view')}
                                className="text-xs font-bold font-rajdhani uppercase text-foreground bg-white/10 px-3 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => console.log('List view')}
                                className="text-xs font-bold font-rajdhani uppercase text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {printers.map((printer) => (
                        <PrinterCard
                            key={printer.id}
                            id={printer.id}
                            name={printer.name}
                            status={printer.status}
                            progress={printer.progress}
                            timeLeft={printer.timeLeft}
                            temps={printer.temps}
                            file={printer.file}
                            ipAddress={printer.ipAddress}
                            onEdit={handleEdit}
                            onRemove={handleRemove}
                        />
                    ))}

                    {/* Add New Printer Card (Placeholder) */}
                    <button
                        onClick={() => window.location.href = '/printers'}
                        className="group relative rounded-xl border border-dashed border-white/10 bg-transparent p-6 hover:bg-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-4 min-h-[200px] cursor-pointer"
                    >
                        <div
                            className="size-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_20px_-5px_var(--neon-cyan)]">
                            <PlusIcon className="size-8 text-zinc-600 group-hover:text-neon-cyan transition-colors"/>
                        </div>
                        <span
                            className="text-sm font-bold font-rajdhani uppercase tracking-wider text-zinc-500 group-hover:text-neon-cyan transition-colors">Deploy New Unit</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function PlusIcon({className}: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
        </svg>
    )
}

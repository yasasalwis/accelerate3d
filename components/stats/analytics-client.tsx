"use client"

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {Activity, Layers, TrendingUp, Zap} from 'lucide-react'
import {cn} from '@/lib/utils'

interface UsageData {
    date: string
    grams?: number
    hours?: number
    isProjected?: boolean
}

interface MaterialStats {
    type: string
    currentStockGrams: number
}

interface AnalyticsClientProps {
    usageData: UsageData[]
    materialStats: MaterialStats[]
    stats: {
        successRate: string
        avgPrintTime: string
        totalMaterial: string
        activeNodes: string
    }
}

const COLORS = ['#CCFF00', '#00FFFF', '#FF0033', '#8b5cf6', '#f59e0b']

export default function AnalyticsClient({usageData, materialStats, stats}: AnalyticsClientProps) {
    // Top Stats Structure
    const topStats = [
        {label: "Fleet Success Rate", value: stats.successRate, icon: Activity, color: "neon-lime"},
        {label: "Avg. Print Time", value: stats.avgPrintTime, icon: TrendingUp, color: "neon-cyan"},
        {label: "Total Material", value: stats.totalMaterial, icon: Layers, color: "neon-red"},
        {label: "Active Nodes", value: stats.activeNodes, icon: Zap, color: "neon-lime"},
    ]

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter uppercase font-rajdhani text-white">Fleet
                        Analytics</h1>
                    <p className="text-sm text-zinc-500 font-mono">Performance metrics and resource utilization.</p>
                </div>
                <div className="flex gap-2">
                    {['7D', '30D', '90D', 'ALL'].map(t => (
                        <button
                            key={t}
                            onClick={() => console.log('Change range', t)}
                            className="px-3 py-1 text-[10px] font-bold border border-white/10 rounded bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topStats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 glass group">
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={cn("size-5", `text-${stat.color}`)}/>
                            {/* Placeholder trend for now, could be calculated if we had previous period data */}
                            <span className="text-[10px] font-mono text-zinc-600">--</span>
                        </div>
                        <h4 className="text-2xl font-bold text-white font-rajdhani">{stat.value}</h4>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Material Usage over time */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 glass">
                    <h3 className="text-lg font-bold font-rajdhani uppercase tracking-tight text-white mb-6">Material
                        Consumption (Grams)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorGrams" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10"/>
                                <XAxis dataKey="date" stroke="#666" fontSize={10} axisLine={false} tickLine={false}/>
                                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false}/>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        borderColor: '#ffffff10',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{color: '#CCFF00'}}
                                    labelFormatter={(label, payload) => {
                                        const isProjected = payload?.[0]?.payload?.isProjected;
                                        return isProjected ? `${label} (Projected)` : label;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="grams"
                                    stroke="#CCFF00"
                                    fillOpacity={1}
                                    fill="url(#colorGrams)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Distribution */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 glass">
                    <h3 className="text-lg font-bold font-rajdhani uppercase tracking-tight text-white mb-6">Material
                        Inventory</h3>
                    <div className="h-[300px] w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={materialStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="currentStockGrams"
                                    nameKey="type"
                                >
                                    {materialStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        borderColor: '#ffffff10',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 pr-8">
                            {materialStats.map((m, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="size-2 rounded-full"
                                         style={{backgroundColor: COLORS[i % COLORS.length]}}/>
                                    <span
                                        className="text-[10px] font-bold text-zinc-400 font-mono uppercase">{m.type}</span>
                                    <span
                                        className="text-[10px] text-zinc-600 font-mono">{(m.currentStockGrams / 1000).toFixed(1)}kg</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Print Hours */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 glass lg:col-span-2">
                    <h3 className="text-lg font-bold font-rajdhani uppercase tracking-tight text-white mb-6">Unit
                        Runtime (Hours)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10"/>
                                <XAxis dataKey="date" stroke="#666" fontSize={10} axisLine={false} tickLine={false}/>
                                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false}
                                       tickFormatter={(v) => `${v}h`}/>
                                <Tooltip
                                    cursor={{fill: '#ffffff05'}}
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        borderColor: '#ffffff10',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={(label, payload) => {
                                        const isProjected = payload?.[0]?.payload?.isProjected;
                                        return isProjected ? `${label} (Projected)` : label;
                                    }}
                                />
                                <Bar dataKey="hours" fill="#00FFFF" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}


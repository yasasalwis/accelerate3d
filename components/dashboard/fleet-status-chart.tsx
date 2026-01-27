"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface FleetData {
    name: string
    value: number
    color: string
}

interface FleetStatusChartProps {
    data: FleetData[]
}

export function FleetStatusChart({ data }: FleetStatusChartProps) {
    // Calculate total active percentage for the center text
    const total = data.reduce((acc, curr) => acc + curr.value, 0)
    const active = data.find(d => d.name === 'Active')?.value || 0
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0

    return (
        <div className="relative size-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
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
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="stroke-transparent" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [value, 'Printers']}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Ring Text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-bold font-mono tracking-tighter text-foreground">{activePercentage}%</span>
                <span className="text-[10px] uppercase text-zinc-500 tracking-widest font-semibold">Active</span>
            </div>
        </div>
    )
}

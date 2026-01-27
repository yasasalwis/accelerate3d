"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Printer, FileBox, ListOrdered, BarChart3, ChevronLeft, ChevronRight, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const sidebarItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Printers", href: "/printers", icon: Printer },
    { name: "3D Models", href: "/models", icon: FileBox },
    { name: "Queue", href: "/queue", icon: ListOrdered },
    { name: "Analytics", href: "/stats", icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className={cn(
            "h-screen flex flex-col border-r border-white/5 transition-all duration-300 ease-in-out relative glass-card z-40 bg-black/40",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-center border-b border-white/5 bg-white/5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-700 animate-[shimmer_2s_infinite]" />
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter relative z-10">
                    {isCollapsed ? (
                        <span className="text-neon-red font-rajdhani">A3D</span>
                    ) : (
                        <>
                            <span className="text-foreground font-rajdhani">ACCELERATE</span>
                            <span className="text-neon-red font-rajdhani">3D</span>
                        </>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-sm font-medium relative overflow-hidden",
                                isActive
                                    ? "bg-neon-red/10 text-white ring-1 ring-neon-red/20 glow-red"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white hover:ring-1 hover:ring-white/10",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            {/* Active pill accent line */}
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red shadow-[0_0_10px_var(--neon-red)]" />
                            )}

                            <Icon className={cn("size-4", isActive ? "text-neon-red" : "group-hover:text-white transition-colors")} />

                            {!isCollapsed && <span className="font-rajdhani uppercase tracking-wide">{item.name}</span>}

                            {isActive && !isCollapsed && (
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-red shadow-[0_0_8px_var(--neon-red)]" />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-3 border-t border-white/5 bg-black/20">
                <button className={cn(
                    "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/10 cursor-pointer",
                    isCollapsed && "justify-center"
                )}>
                    <div className="size-8 rounded-full bg-zinc-800 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                        <User className="size-4 text-zinc-400" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate text-zinc-200">Admin User</span>
                            <span className="text-xs text-zinc-500 truncate">admin@accelerate3d.com</span>
                        </div>
                    )}
                </button>
            </div>

            {/* Collapse Toggle - Moved to bottom bar */}
            <div className="h-10 border-t border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? (
                    <PanelLeftOpen className="size-4 text-zinc-500 hover:text-foreground transition-colors" />
                ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-foreground transition-colors">
                        <PanelLeftClose className="size-4" />
                        <span>Collapse Sidebar</span>
                    </div>
                )}
            </div>

        </div>
    )
}

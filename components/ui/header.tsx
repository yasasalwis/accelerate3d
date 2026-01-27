"use client"

import {usePathname} from "next/navigation"
import {Bell} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {NotificationList} from "@/components/notifications/notification-list"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Notification} from "@/types/notification"

export function Header() {
    const pathname = usePathname()
    const queryClient = useQueryClient()

    const {data: notifications = []} = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await fetch("/api/notifications")
            if (!res.ok) throw new Error("Failed to fetch notifications")
            return res.json()
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    })

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/notifications/${id}/read`, {method: "PATCH"})
            if (!res.ok) throw new Error("Failed to mark notification as read")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["notifications"]})
        },
    })

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/notifications/read-all", {method: "PATCH"})
            if (!res.ok) throw new Error("Failed to mark all as read")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["notifications"]})
        },
    })

    const unreadCount = notifications.filter(n => !n.read).length

    // Simple breadcrumb logic
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentPage = pathSegments.length > 0
        ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
        : "Dashboard"

    return (
        <header
            className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-medium text-zinc-400">Accelerate3D</span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-200 font-medium tracking-tight">{currentPage}</span>
            </div>

            {/* Global Status & Actions */}
            <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <Badge variant="premium" className="gap-2 px-3 py-1 font-mono uppercase tracking-wider">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    System Online
                </Badge>

                <Popover>
                    <PopoverTrigger asChild>
                        <button className="relative p-2 text-zinc-500 hover:text-zinc-200 transition-colors">
                            <Bell className="size-5"/>
                            {unreadCount > 0 && (
                                <span
                                    className="absolute top-1.5 right-1.5 size-2 bg-red-600 rounded-full border border-background shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border-none bg-transparent" align="end" sideOffset={12}>
                        <NotificationList
                            notifications={notifications}
                            onMarkRead={(id) => markReadMutation.mutate(id)}
                            onMarkAllRead={() => markAllReadMutation.mutate()}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    )
}

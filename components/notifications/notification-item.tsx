"use client"

import {Notification} from "@/types/notification"
import {cn} from "@/lib/utils"
import {formatDistanceToNow} from "date-fns"
import {AlertTriangle, Bell, CheckCircle, Info, XCircle} from "lucide-react"

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
}

export function NotificationItem({notification, onRead}: NotificationItemProps) {
    const Icon = {
        INFO: Info,
        WARNING: AlertTriangle,
        SUCCESS: CheckCircle,
        ERROR: XCircle,
    }[notification.type] || Bell

    const typeColors = {
        INFO: "text-blue-400",
        WARNING: "text-amber-400",
        SUCCESS: "text-emerald-400",
        ERROR: "text-red-400",
    }

    return (
        <div
            className={cn(
                "p-4 border-b border-white/5 transition-colors cursor-pointer hover:bg-white/5 relative group",
                !notification.read && "bg-neon-red/5"
            )}
            onClick={() => !notification.read && onRead(notification.id)}
        >
            <div className="flex gap-3">
                <div className={cn("mt-1 shrink-0", typeColors[notification.type])}>
                    <Icon className="size-4"/>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <p className={cn(
                            "text-sm font-medium",
                            notification.read ? "text-zinc-300" : "text-white"
                        )}>
                            {notification.title}
                        </p>
                        {!notification.read && (
                            <div className="size-2 rounded-full bg-neon-red shadow-[0_0_8px_var(--neon-red)] mt-1.5"/>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        {notification.message}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                        {formatDistanceToNow(new Date(notification.createdAt), {addSuffix: true})}
                    </p>
                </div>
            </div>
        </div>
    )
}

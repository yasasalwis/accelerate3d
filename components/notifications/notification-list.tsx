"use client"

import {Notification} from "@/types/notification"
import {NotificationItem} from "./notification-item"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Button} from "@/components/ui/button"
import {Check} from "lucide-react"

interface NotificationListProps {
    notifications: Notification[]
    onMarkRead: (id: string) => void
    onMarkAllRead: () => void
}

export function NotificationList({notifications, onMarkRead, onMarkAllRead}: NotificationListProps) {
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div
            className="w-80 flex flex-col glass-card border border-white/10 shadow-2xl overflow-hidden bg-black/80 backdrop-blur-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                    <h3 className="text-sm font-bold tracking-tight text-white font-rajdhani uppercase">Notifications</h3>
                    <p className="text-[10px] text-zinc-500 font-mono italic">
                        {unreadCount} UNREAD ALERTS
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMarkAllRead}
                        className="h-8 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                        <Check className="size-3 mr-1.5"/>
                        Mark All Read
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 max-h-[400px]">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                        <div
                            className="size-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4">
                            <Check className="size-5 text-zinc-600"/>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium font-rajdhani uppercase">All clear</p>
                        <p className="text-[10px] text-zinc-600 font-mono">No new messages from terminal.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={onMarkRead}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-2 border-t border-white/5 bg-white/5 text-center">
                <Button
                    onClick={() => console.log('View history')}
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white cursor-pointer"
                >
                    View Alert History
                </Button>
            </div>
        </div>
    )
}

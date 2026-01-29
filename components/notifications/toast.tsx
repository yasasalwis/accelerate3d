"use client"

import {Toast, useNotifications} from "./notification-context"
import {cn} from "@/lib/utils"
import {AlertTriangle, CheckCircle, Info, X, XCircle} from "lucide-react"
import {useEffect, useState} from "react"

function ToastItem({toast, onDismiss}: { toast: Toast; onDismiss: () => void }) {
    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true))
    }, [])

    const handleDismiss = () => {
        setIsExiting(true)
        setTimeout(onDismiss, 200) // Wait for exit animation
    }

    const Icon = {
        INFO: Info,
        WARNING: AlertTriangle,
        SUCCESS: CheckCircle,
        ERROR: XCircle,
    }[toast.type]

    const typeStyles = {
        INFO: "border-blue-500/30 bg-blue-500/10",
        WARNING: "border-amber-500/30 bg-amber-500/10",
        SUCCESS: "border-emerald-500/30 bg-emerald-500/10",
        ERROR: "border-red-500/30 bg-red-500/10",
    }

    const iconStyles = {
        INFO: "text-blue-400",
        WARNING: "text-amber-400",
        SUCCESS: "text-emerald-400",
        ERROR: "text-red-400",
    }

    return (
        <div
            className={cn(
                "pointer-events-auto w-80 rounded-lg border backdrop-blur-xl shadow-2xl transition-all duration-200",
                typeStyles[toast.type],
                isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}
        >
            <div className="flex items-start gap-3 p-4">
                <Icon className={cn("size-5 shrink-0 mt-0.5", iconStyles[toast.type])}/>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{toast.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="size-4"/>
                </button>
            </div>
        </div>
    )
}

export function ToastContainer() {
    const {toasts, dismissToast} = useNotifications()

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => dismissToast(toast.id)}
                />
            ))}
        </div>
    )
}

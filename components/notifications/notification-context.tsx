"use client"

import React, {createContext, useCallback, useContext, useState} from "react"
import {NotificationType} from "@/types/notification"

export interface Toast {
    id: string
    type: NotificationType
    title: string
    message: string
    duration?: number
}

interface NotificationContextValue {
    toasts: Toast[]
    showToast: (type: NotificationType, title: string, message: string, duration?: number) => void
    dismissToast: (id: string) => void
    showNotification: (type: NotificationType, title: string, message: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}

interface NotificationProviderProps {
    children: React.ReactNode
}

export function NotificationProvider({children}: NotificationProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        duration: number = 5000
    ) => {
        const id = crypto.randomUUID()
        const toast: Toast = {id, type, title, message, duration}

        setToasts(prev => [...prev, toast])

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }
    }, [])

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showNotification = useCallback(async (
        type: NotificationType,
        title: string,
        message: string
    ) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({type, title, message})
            })
            if (!res.ok) {
                console.error("Failed to create notification")
            }
        } catch (error) {
            console.error("Failed to create notification:", error)
        }
    }, [])

    return (
        <NotificationContext.Provider value={{toasts, showToast, dismissToast, showNotification}}>
            {children}
        </NotificationContext.Provider>
    )
}

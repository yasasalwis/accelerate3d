"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ThemeProvider as NextThemesProvider} from "next-themes"
import {useState} from "react"

import {SessionProvider} from "next-auth/react"
import {NotificationProvider} from "@/components/notifications/notification-context"
import {ToastContainer} from "@/components/notifications/toast"

export function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <SessionProvider>
            <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
                <QueryClientProvider client={queryClient}>
                    <NotificationProvider>
                        {children}
                        <ToastContainer/>
                    </NotificationProvider>
                </QueryClientProvider>
            </NextThemesProvider>
        </SessionProvider>
    )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function QueuePoller() {
    const [enabled, setEnabled] = useState(true) // Default to auto-processing
    const [lastRun, setLastRun] = useState<Date | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!enabled) return

        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/cron/process-queue")
                if (res.ok) {
                    setLastRun(new Date())
                    setError(null)
                    // Refresh UI if needed
                    router.refresh()
                } else {
                    setError("Failed to process queue")
                }
            } catch (e) {
                setError("Connection error")
            }
        }, 30000) // Check every 30 seconds

        return () => clearInterval(interval)
    }, [enabled, router])

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-xs p-2 rounded border border-white/10 backdrop-blur text-muted-foreground z-50 group">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>Auto-Scheduler: {enabled ? "active" : "paused"}</span>
                <button
                    onClick={() => setEnabled(!enabled)}
                    className="ml-2 underline hover:text-white"
                >
                    {enabled ? "Pause" : "Resume"}
                </button>
            </div>
            {lastRun && <div className="mt-1">Last check: {lastRun.toLocaleTimeString()}</div>}
            {(error || lastRun) && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-zinc-900 border border-white/10 rounded shadow-xl text-[10px] hidden group-hover:block">
                    {error ? (
                        <span className="text-red-400">{error}</span>
                    ) : (
                        <span className="text-green-400">System functional. {lastRun?.toLocaleTimeString()}</span>
                    )}
                    <div className="mt-1 pt-1 border-t border-white/10 text-zinc-500">
                        Hover to see status
                    </div>
                </div>
            )}
        </div>
    )
}

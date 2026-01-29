"use client"

import {useEffect, useState} from "react"

export function ServerUptime() {
    const [uptime, setUptime] = useState("")

    useEffect(() => {
        const fetchUptime = async () => {
            try {
                const res = await fetch("/api/server-uptime")
                if (res.ok) {
                    const data = await res.json()
                    setUptime(data.formatted)
                }
            } catch {
                // Silent fail, keep previous value
            }
        }

        fetchUptime()
        const interval = setInterval(fetchUptime, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    return <span>Server Uptime: {uptime || "..."}</span>
}

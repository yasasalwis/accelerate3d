import {NextResponse} from "next/server"
import {SERVER_START_TIME} from "@/lib/server-start-time"

export async function GET() {
    const now = Date.now()
    const uptimeMs = now - SERVER_START_TIME

    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))

    let formatted: string
    if (days > 0) {
        formatted = `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
        formatted = `${hours}h ${minutes}m`
    } else {
        formatted = `${minutes}m`
    }

    return NextResponse.json({
        startTime: SERVER_START_TIME,
        uptimeMs,
        formatted,
    })
}

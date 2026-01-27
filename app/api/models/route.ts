import {NextResponse} from "next/server"
import {db} from "@/lib/db"

export async function GET() {
    try {
        const models = await db.model.findMany({
            orderBy: {createdAt: 'desc'}
        })
        return NextResponse.json(models)
    } catch (error) {
        console.error("Failed to fetch models", error)
        return NextResponse.json({error: "Failed to fetch models"}, {status: 500})
    }
}

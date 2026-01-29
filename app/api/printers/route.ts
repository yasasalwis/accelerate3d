import {NextResponse} from "next/server"
import {db} from "@/lib/db"

import {getServerSession} from "next-auth"
import {authOptions} from "@/lib/auth"

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        const user = session?.user as SessionUser | undefined
        if (!user?.id) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        const userId = user.id

        const userPrinters = await db.userPrinter.findMany({
            where: {userId: userId},
            include: {
                printer: {
                    include: {
                        manufacturer: true
                    }
                }
            }
        })

        const printerData = userPrinters.map((up) => ({
            id: up.id,
            name: up.name,
            status: up.status,
            type: up.type,
            make: up.printer.manufacturer.name,
            model: up.printer.model
        }))

        return NextResponse.json(printerData)
    } catch (error) {
        console.error("Failed to fetch printers", error)
        return NextResponse.json({error: "Failed to fetch printers"}, {status: 500})
    }
}

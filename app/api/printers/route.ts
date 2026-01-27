import {NextResponse} from "next/server"
import {db} from "@/lib/db"

// Constant for dev mode - matching the pattern in app/printers/page.tsx
const MOCK_USER_ID = "dev-user-001"

export async function GET() {
    try {
        const userPrinters = await db.userPrinter.findMany({
            where: {userId: MOCK_USER_ID},
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

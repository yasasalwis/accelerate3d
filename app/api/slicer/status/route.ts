import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get("X-Api-Key");

    if (!apiKey) {
        return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    try {
        const userPrinter = await db.userPrinter.findFirst({
            where: { apiKey },
            include: { user: true }
        });

        if (!userPrinter) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
        }

        return NextResponse.json({
            status: "ready",
            printer: userPrinter.name,
            user: userPrinter.user.username,
            server: "Accelerate3D v1.0"
        });
    } catch (error) {
        console.error("Slicer Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

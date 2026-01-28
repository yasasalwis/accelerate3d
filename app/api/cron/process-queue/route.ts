
import { NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/scheduler";

export async function GET() {
    try {
        const result = await processPendingJobs();
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Allow POST as well for flexibility
export async function POST() {
    try {
        const result = await processPendingJobs();
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

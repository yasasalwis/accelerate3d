import {NextResponse} from "next/server";
import {processPendingJobs} from "@/lib/scheduler";

export async function GET() {
    try {
        const result = await processPendingJobs();
        return NextResponse.json({success: true, result});
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({success: false, error: e.message}, {status: 500});
    }
}

// Allow POST as well for flexibility
export async function POST() {
    try {
        const result = await processPendingJobs();
        return NextResponse.json({success: true, result});
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({success: false, error: e.message}, {status: 500});
    }
}

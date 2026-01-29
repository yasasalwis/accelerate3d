import {NextResponse} from "next/server"

export async function GET(request: Request) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    searchParams.get("type");  // 'prusa', 'orca', 'bambu' - reserved for future use

    if (!path) {
        return NextResponse.json({ error: "Profile path required" }, { status: 400 })
    }

    // Mock logic: generate deterministic defaults based on path string to show variation
    const isQuality = path.toLowerCase().includes("quality") || path.toLowerCase().includes("fine")
    const isStrong = path.toLowerCase().includes("strong") || path.toLowerCase().includes("petg")

    const defaults = {
        supports: isStrong, // Strong profiles might default to supports on
        supportType: "grid", // 'grid', 'snug', 'organic'
        brim: isStrong, // Strong materials often need brim
        brimWidth: 5,
        infill: isQuality ? "20%" : "15%",
        infillPattern: "grid" // 'grid', 'gyroid', 'rectilinear'
    }

    return NextResponse.json(defaults)
}

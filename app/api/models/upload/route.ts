import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { writeFile } from "fs/promises"
import path from "path"
import { parseGCode } from "@/lib/gcode-parser"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File
        const name = formData.get("name") as string
        const widthMm = parseFloat(formData.get("width") as string || "0")
        const depthMm = parseFloat(formData.get("depth") as string || "0")
        const heightMm = parseFloat(formData.get("height") as string || "0")
        const estimatedTime = parseInt(formData.get("estimatedTime") as string || "0")
        const filamentGrams = parseFloat(formData.get("filamentGrams") as string || "0")

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate a unique filename to avoid collisions
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const filename = `${timestamp}-${safeName}`
        const storagePath = path.join(process.cwd(), "public", "models", filename)

        // Save file to public/models/
        await writeFile(storagePath, buffer)

        // Detect if this is a G-code file and parse metadata
        let parsedMetadata = null
        const isGcodeFile = file.name.toLowerCase().endsWith('.gcode')

        if (isGcodeFile) {
            const gcodeContent = buffer.toString('utf-8')
            parsedMetadata = parseGCode(gcodeContent)
        }

        // Create database record
        // Use parsed metadata if available, otherwise fall back to form data
        const model = await db.model.create({
            data: {
                name: name || file.name,
                filePath: `/models/${filename}`,
                gcodePath: isGcodeFile ? `/models/${filename}` : null,
                widthMm: parsedMetadata?.widthMm || widthMm,
                depthMm: parsedMetadata?.depthMm || depthMm,
                heightMm: parsedMetadata?.heightMm || heightMm,
                estimatedTime: parsedMetadata?.estimatedTime || estimatedTime,
                filamentGrams: parsedMetadata?.filamentGrams || filamentGrams,
                material: parsedMetadata?.material || null,
                layerHeightMm: parsedMetadata?.layerHeightMm || null,
                nozzleTempC: parsedMetadata?.nozzleTempC || null,
                bedTempC: parsedMetadata?.bedTempC || null,
            },
        })

        return NextResponse.json({
            ...model,
            parsedMetadata: isGcodeFile ? parsedMetadata : null
        })
    } catch (error) {
        console.error("Upload Error:", error)
        return NextResponse.json({ error: "Failed to upload model" }, { status: 500 })
    }
}

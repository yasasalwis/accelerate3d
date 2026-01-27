import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { parseGCode } from "@/lib/gcode-parser";

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get("X-Api-Key");

    if (!apiKey) {
        return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    try {
        // 1. Verify API Key
        const userPrinter = await db.userPrinter.findFirst({
            where: { apiKey }
        });

        if (!userPrinter) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
        }

        // 2. Process Upload
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const gcodeContent = buffer.toString('utf-8');

        // 3. Parse Metadata
        const metadata = parseGCode(gcodeContent);

        // 4. Save File
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${timestamp}-${safeName}`;

        const storageDir = path.join(process.cwd(), "public", "models");
        await mkdir(storageDir, { recursive: true });

        const storagePath = path.join(storageDir, filename);
        await writeFile(storagePath, buffer);

        // 5. Create Database Record
        const model = await db.model.create({
            data: {
                name: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
                filePath: `/models/${filename}`,
                gcodePath: `/models/${filename}`,
                widthMm: metadata.widthMm || 0,
                depthMm: metadata.depthMm || 0,
                heightMm: metadata.heightMm || 0,
                estimatedTime: metadata.estimatedTime || 0,
                filamentGrams: metadata.filamentGrams || 0,
                material: metadata.material || null,
                layerHeightMm: metadata.layerHeightMm || null,
                nozzleTempC: metadata.nozzleTempC || null,
                bedTempC: metadata.bedTempC || null,
            },
        });

        return NextResponse.json({
            success: true,
            modelId: model.id,
            metadata
        });

    } catch (error) {
        console.error("Slicer Upload Error:", error);
        return NextResponse.json({ error: "Failed to process slicer upload" }, { status: 500 });
    }
}

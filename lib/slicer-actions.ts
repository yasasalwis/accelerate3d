"use server"

import { writeFile, readFile, unlink, mkdir } from "fs/promises"
import path from "path"
import os from "os"
import { exec } from "child_process"
import { promisify } from "util"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"

const execAsync = promisify(exec)

interface SliceState {
    error?: string;
    success?: boolean;
    gcodeUrl?: string;
    filename?: string;
    modelId?: string;
}

export async function sliceFile(_prevState: SliceState | null, formData: FormData): Promise<SliceState> {
    const file = formData.get("file") as File
    const slicerType = formData.get("slicerType") as string
    const profilePath = formData.get("profilePath") as string
    const overrides = formData.get("overrides") as string // JSON string

    // Backend Compatibility Note:
    // The backend needs to handle both .ini (Prusa) and .json (Orca) file formats when applying these overrides.
    // For now, we are just receiving them.
    if (overrides) {
        console.log("Received overrides:", overrides)
    }

    if (!file || !slicerType || !profilePath) {
        return { error: "Missing required fields" }
    }

    const uniqueId = randomUUID()
    const originalName = path.parse(file.name).name
    const stlFileName = `${uniqueId}-${file.name}`
    const gcodeFileName = `${uniqueId}-${originalName}.gcode`

    // Directories
    const publicModelsDir = path.join(process.cwd(), "public", "models")
    const publicGcodeDir = path.join(process.cwd(), "public", "gcode")
    const tempDir = os.tmpdir()

    await mkdir(publicModelsDir, { recursive: true })
    await mkdir(publicGcodeDir, { recursive: true })

    const stlPath = path.join(publicModelsDir, stlFileName)
    const _tempInputPath = path.join(tempDir, stlFileName) // Needed for CLI? Usually fine to use absolute path
    const tempOutputPath = path.join(tempDir, gcodeFileName)
    const finalGcodePath = path.join(publicGcodeDir, gcodeFileName)

    try {
        // 1. Write uploaded file to public/models (Permanent Storage)
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(stlPath, buffer)

        // 2. Construct Command
        // We use the permanent STL path as input
        let command = ""
        if (slicerType.toLowerCase() === "prusa") {
            // PrusaSlicer syntax
            command = `prusa-slicer -g --load "${profilePath}" "${stlPath}" -o "${tempOutputPath}"`
        } else if (slicerType.toLowerCase() === "orca") {
            // OrcaSlicer syntax
            command = `orca-slicer --slice --load "${profilePath}" "${stlPath}" -o "${tempOutputPath}"`
        } else if (slicerType.toLowerCase() === "bambu") {
            // BambuStudio syntax
            // Assuming default Mac location. User needs to ensure it's accessible.
            const bambuExecutable = "/Applications/BambuStudio.app/Contents/MacOS/BambuStudio"
            command = `"${bambuExecutable}" --slice --load "${profilePath}" "${stlPath}" -o "${tempOutputPath}"`
        } else {
            return { error: "Invalid slicer type" }
        }

        console.log("Executing slicer command:", command)

        // 3. Execute Slicer
        try {
            await execAsync(command)
        } catch (execError: unknown) {
            const error = execError as Error;
            console.error("Slicer execution failed:", error);
            return { error: `Slicer execution failed: ${error.message || execError}` }
        }

        // 4. Move G-Code to public directory
        try {
            const gcodeContent = await readFile(tempOutputPath)
            await writeFile(finalGcodePath, gcodeContent)
        } catch (readError) {
            console.error("Failed to read generated G-code:", readError)
            return { error: "Failed to read generated G-code. It might not have been created." }
        }

        // 5. Cleanup Temp
        await unlink(tempOutputPath).catch(() => { })

        // 6. Create DB Record
        try {
            const model = await db.model.create({
                data: {
                    name: originalName,
                    filePath: `/models/${stlFileName}`,
                    gcodePath: `/gcode/${gcodeFileName}`,
                    // Determine stats if possible, else 0
                    widthMm: 0,
                    depthMm: 0,
                    heightMm: 0,
                    estimatedTime: 0,
                    filamentGrams: 0,
                    createdAt: new Date(),
                }
            })

            // 7. Return Success
            return {
                success: true,
                gcodeUrl: `/gcode/${gcodeFileName}`,
                filename: gcodeFileName,
                modelId: model.id
            }

        } catch (dbError: unknown) {
            const error = dbError as Error;
            console.error("Failed to save model to DB:", error);
            return { error: "Slicing successful, but failed to save to database." }
        }

    } catch (error: unknown) {
        const e = error as Error;
        console.error("Slice action error:", e);
        return { error: e.message || "Unknown error during slicing" }
    }
}

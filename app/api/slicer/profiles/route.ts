import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// Define interface for the profile object
interface SlicerProfile {
    name: string;
    path: string;
}

interface SlicerProfilesResponse {
    prusa: SlicerProfile[];
    orca: SlicerProfile[];
    bambu: SlicerProfile[];
}

export async function GET() {
    const homeDir = os.homedir();
    const profiles: SlicerProfilesResponse = {
        prusa: [],
        orca: [],
        bambu: [],
    };

    // ---------------------------------------------------------------------------
    // 1. PrusaSlicer Detection
    // ---------------------------------------------------------------------------
    // macOS Path: ~/Library/Application Support/PrusaSlicer/print/
    // Windows Path: %AppData%\PrusaSlicer\print\
    // Linux Path: ~/.config/PrusaSlicer/print/
    // ADJUST_PATH_BELOW: Modify this path if your PrusaSlicer profiles are stored elsewhere.
    const prusaPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "PrusaSlicer",
        "print"
    );

    try {
        if (fs.existsSync(prusaPath)) {
            const files = fs.readdirSync(prusaPath);
            profiles.prusa = files
                .filter((file) => file.endsWith(".ini"))
                .map((file) => ({
                    name: path.parse(file).name, // Use filename without extension as profile name
                    path: path.join(prusaPath, file),
                }));
        }
    } catch (error) {
        console.warn("Error reading PrusaSlicer profiles:", error);
        // Continue execution to check for other slicers
    }

    // ---------------------------------------------------------------------------
    // 2. OrcaSlicer Detection
    // ---------------------------------------------------------------------------
    // macOS Path: ~/Library/Application Support/OrcaSlicer/user/default/process/
    // Windows Path: %AppData%\OrcaSlicer\user\default\process\
    // Linux Path: ~/.config/OrcaSlicer/user/default/process/
    // ADJUST_PATH_BELOW: check 'default' folder. If you logged in with an account, this might be a hashed ID or username.
    const orcaPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "OrcaSlicer",
        "user",
        "default",
        "process"
    );

    try {
        if (fs.existsSync(orcaPath)) {
            const files = fs.readdirSync(orcaPath);
            profiles.orca = files
                .filter((file) => file.endsWith(".json"))
                .map((file) => ({
                    name: path.parse(file).name, // Use filename without extension as profile name
                    path: path.join(orcaPath, file),
                }));
        }
    } catch (error) {
        console.warn("Error reading OrcaSlicer profiles:", error);
        // Continue execution
    }

    // ---------------------------------------------------------------------------
    // 3. BambuStudio Detection
    // ---------------------------------------------------------------------------
    // macOS Path: ~/Library/Application Support/BambuStudio/user/default/process/
    // Windows Path: %AppData%\BambuStudio\user\default\process\
    // Linux Path: ~/.config/BambuStudio/user/default/process/
    const bambuPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "BambuStudio",
        "user",
        "default",
        "process"
    );

    try {
        if (fs.existsSync(bambuPath)) {
            const files = fs.readdirSync(bambuPath);
            profiles.bambu = files
                .filter((file) => file.endsWith(".json"))
                .map((file) => ({
                    name: path.parse(file).name,
                    path: path.join(bambuPath, file),
                }));
        }
    } catch (error) {
        console.warn("Error reading BambuStudio profiles:", error);
    }

    return NextResponse.json(profiles);
}

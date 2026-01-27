export interface GCodeMetadata {
    estimatedTime?: number; // seconds
    filamentGrams?: number;
    widthMm?: number;
    depthMm?: number;
    heightMm?: number;
    material?: string; // PLA, ABS, PETG, TPU, NYLON, etc.
    layerHeightMm?: number;
    nozzleTempC?: number;
    bedTempC?: number;
}

/**
 * Parse G-code file content to extract metadata.
 * Supports multiple slicer formats: PrusaSlicer, Cura, BambuStudio, Simplify3D, etc.
 */
export function parseGCode(content: string): GCodeMetadata {
    const lines = content.split('\n');
    const metadata: GCodeMetadata = {};

    // Search through header comments (typically first 200 lines) and footer (last 200 lines)
    const searchLines = [...lines.slice(0, 200), ...lines.slice(-200)];

    for (const line of searchLines) {
        const trimmed = line.trim();

        // === Material Type Detection ===

        // PrusaSlicer/BambuStudio: "; filament_type = PLA"
        if (trimmed.match(/;\s*filament_type\s*=\s*(\w+)/i)) {
            const match = trimmed.match(/;\s*filament_type\s*=\s*(\w+)/i);
            if (match && !metadata.material) metadata.material = match[1].toUpperCase();
        }

        // Cura: ";MATERIAL:PLA"
        if (trimmed.match(/;\s*MATERIAL:\s*(\w+)/i)) {
            const match = trimmed.match(/;\s*MATERIAL:\s*(\w+)/i);
            if (match && !metadata.material) metadata.material = match[1].toUpperCase();
        }

        // Simplify3D: "; filamentType,PLA"
        if (trimmed.match(/;\s*filamentType,\s*(\w+)/i)) {
            const match = trimmed.match(/;\s*filamentType,\s*(\w+)/i);
            if (match && !metadata.material) metadata.material = match[1].toUpperCase();
        }

        // === Layer Height Detection ===

        // PrusaSlicer/BambuStudio: "; layer_height = 0.2"
        if (trimmed.match(/;\s*layer_height\s*=\s*([\d.]+)/i)) {
            const match = trimmed.match(/;\s*layer_height\s*=\s*([\d.]+)/i);
            if (match && !metadata.layerHeightMm) metadata.layerHeightMm = parseFloat(match[1]);
        }

        // Cura: ";Layer height: 0.2"
        if (trimmed.match(/;\s*Layer height:\s*([\d.]+)/i)) {
            const match = trimmed.match(/;\s*Layer height:\s*([\d.]+)/i);
            if (match && !metadata.layerHeightMm) metadata.layerHeightMm = parseFloat(match[1]);
        }

        // === Temperature Detection ===

        // PrusaSlicer: "; temperature = 210", "; first_layer_temperature = 210"
        if (trimmed.match(/;\s*(first_layer_)?temperature\s*=\s*(\d+)/i)) {
            const match = trimmed.match(/;\s*(first_layer_)?temperature\s*=\s*(\d+)/i);
            if (match && !metadata.nozzleTempC) metadata.nozzleTempC = parseInt(match[2]);
        }

        // PrusaSlicer: "; bed_temperature = 60", "; first_layer_bed_temperature = 60"
        if (trimmed.match(/;\s*(first_layer_)?bed_temperature\s*=\s*(\d+)/i)) {
            const match = trimmed.match(/;\s*(first_layer_)?bed_temperature\s*=\s*(\d+)/i);
            if (match && !metadata.bedTempC) metadata.bedTempC = parseInt(match[2]);
        }

        // === Estimated Time Detection ===

        // PrusaSlicer/BambuStudio: "; estimated printing time (normal mode) = 1h 23m 45s"
        if (trimmed.includes('estimated printing time') && !metadata.estimatedTime) {
            const hMatch = trimmed.match(/(\d+)h/);
            const mMatch = trimmed.match(/(\d+)m/);
            const sMatch = trimmed.match(/(\d+)s/);

            let totalSeconds = 0;
            if (hMatch) totalSeconds += parseInt(hMatch[1]) * 3600;
            if (mMatch) totalSeconds += parseInt(mMatch[1]) * 60;
            if (sMatch) totalSeconds += parseInt(sMatch[1]);

            if (totalSeconds > 0) metadata.estimatedTime = totalSeconds;
        }

        // Cura: ";TIME:5023"
        if (trimmed.startsWith(';TIME:') && !metadata.estimatedTime) {
            const timeStr = trimmed.replace(';TIME:', '');
            const time = parseInt(timeStr);
            if (!isNaN(time)) metadata.estimatedTime = time;
        }

        // === Filament Usage (Weight) ===

        // PrusaSlicer: "; filament used [g] = 12.34"
        if (trimmed.match(/;\s*filament used \[g\]\s*=\s*([\d.]+)/i) && !metadata.filamentGrams) {
            const match = trimmed.match(/;\s*filament used \[g\]\s*=\s*([\d.]+)/i);
            if (match) metadata.filamentGrams = parseFloat(match[1]);
        }

        // Cura: ";Filament weight = 12.34"
        if (trimmed.match(/;\s*Filament weight\s*=\s*([\d.]+)/i) && !metadata.filamentGrams) {
            const match = trimmed.match(/;\s*Filament weight\s*=\s*([\d.]+)/i);
            if (match) metadata.filamentGrams = parseFloat(match[1]);
        }
    }

    // === Dimensions (Bounding Box) ===
    // Often found in footer comments
    let minX, maxX, minY, maxY, minZ, maxZ;

    for (const line of lines.slice(-500)) {
        const trimmed = line.trim();

        if (trimmed.match(/;\s*min_x\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*min_x\s*=\s*([\d.-]+)/i);
            if (match) minX = parseFloat(match[1]);
        }
        if (trimmed.match(/;\s*max_x\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*max_x\s*=\s*([\d.-]+)/i);
            if (match) maxX = parseFloat(match[1]);
        }
        if (trimmed.match(/;\s*min_y\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*min_y\s*=\s*([\d.-]+)/i);
            if (match) minY = parseFloat(match[1]);
        }
        if (trimmed.match(/;\s*max_y\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*max_y\s*=\s*([\d.-]+)/i);
            if (match) maxY = parseFloat(match[1]);
        }
        if (trimmed.match(/;\s*min_z\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*min_z\s*=\s*([\d.-]+)/i);
            if (match) minZ = parseFloat(match[1]);
        }
        if (trimmed.match(/;\s*max_z\s*=\s*([\d.-]+)/i)) {
            const match = trimmed.match(/;\s*max_z\s*=\s*([\d.-]+)/i);
            if (match) maxZ = parseFloat(match[1]);
        }
    }

    if (minX !== undefined && maxX !== undefined) metadata.widthMm = Math.abs(maxX - minX);
    if (minY !== undefined && maxY !== undefined) metadata.depthMm = Math.abs(maxY - minY);
    if (minZ !== undefined && maxZ !== undefined) metadata.heightMm = Math.abs(maxZ - minZ);

    return metadata;
}

import fs from 'fs';
import path from 'path';

/**
 * Injects the eject G-code into the original G-code file.
 * Logic:
 * 1. Read original content.
 * 2. Find the last occurrence of "M84" (Disable motors) which is usually at the end script.
 * 3. Insert eject G-code BEFORE M84, so motors are still active if needed for movement.
 *    OR: If M84 is not found, append to the end.
 *    NOTE: User request says "after printing the GCODE and before stopping all (Motors)".
 *
 * @param originalPath Path to the source G-code file
 * @param ejectGcode User provided G-code to inject
 * @returns Path to the newly created temporary file with injected code
 */
export function injectEjectGcode(originalPath: string, ejectGcode: string): string {
    if (!fs.existsSync(originalPath)) {
        throw new Error(`Original G-code file not found: ${originalPath}`);
    }

    const originalContent = fs.readFileSync(originalPath, 'utf-8');

    // Normalize newlines to ensure consistent matching
    // Replace CRLF with LF
    const normalizedContent = originalContent.replace(/\r\n/g, '\n');

    // Standard End Script to find and replace
    // Matches:
    // M104 S0 ; turn off temperature
    // M140 S0 ; turn off heatbed
    // G28 X0  ; home X axis
    // M84     ; disable motors
    // We use a regex that is flexible with whitespace and comments
    // Note: 's' flag removed for compatibility, explicitly relying on \n matching
    const targetBlockRegex = /M104 S0\s*;.*?\n\s*M140 S0\s*;.*?\n\s*G28 X0\s*;.*?\n\s*M84\s*;.*?/;

    // Alternative: Exact string matching if regex is too risky, but user's snippet had specific comments.
    // Let's try to match the "intent" of the block better with regex.

    let newContent = '';

    if (targetBlockRegex.test(normalizedContent)) {
        console.log("Found standard end script. Replacing with Eject G-code.");
        newContent = normalizedContent.replace(targetBlockRegex, `\n; --- START INJECTED EJECT GCODE (REPLACED STANDARD END) ---\n${ejectGcode}\n; --- END INJECTED EJECT GCODE ---\n`);
    } else {
        console.log("Standard end script not found. Falling back to inserting before M84.");

        const lines = normalizedContent.split('\n');
        let injectIndex = -1;

        // Find the LAST occurrence of M84 (Disable Steppers)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            // Remove comments for checking
            const cleanLine = line.split(';')[0].trim();
            if (cleanLine.startsWith('M84')) {
                injectIndex = i;
                break;
            }
        }

        const ejectLines = ejectGcode.split('\n');
        const newLines = [...lines];

        if (injectIndex !== -1) {
            // Insert BEFORE M84
            newLines.splice(injectIndex, 0, `; --- START INJECTED EJECT GCODE ---`, ...ejectLines, `; --- END INJECTED EJECT GCODE ---`);
        } else {
            // Append to end if no M84 found
            newLines.push(`; --- START INJECTED EJECT GCODE ---`, ...ejectLines, `; --- END INJECTED EJECT GCODE ---`);
        }
        newContent = newLines.join('\n');
    }

    // Create temp file
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const tempFilename = `injected-${Date.now()}-${path.basename(originalPath)}`;
    const tempPath = path.join(tempDir, tempFilename);

    fs.writeFileSync(tempPath, newContent, 'utf-8');

    return tempPath;
}

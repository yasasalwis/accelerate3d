import {parseGCode} from '../gcode-parser';

describe('parseGCode', () => {
    it('extracts metadata from PrusaSlicer G-code', () => {
        const content = `
; filament_type = PLA
; layer_height = 0.2
; temperature = 210
; bed_temperature = 60
; estimated printing time (normal mode) = 1h 23m 45s
; filament used [g] = 12.34
; min_x = 10
; max_x = 110
; min_y = 10
; max_y = 110
; min_z = 0
; max_z = 50
    `;
        const metadata = parseGCode(content);

        expect(metadata.material).toBe('PLA');
        expect(metadata.layerHeightMm).toBe(0.2);
        expect(metadata.nozzleTempC).toBe(210);
        expect(metadata.bedTempC).toBe(60);
        expect(metadata.estimatedTime).toBe(3600 + 23 * 60 + 45); // 5025
        expect(metadata.filamentGrams).toBe(12.34);
        expect(metadata.widthMm).toBe(100);
        expect(metadata.depthMm).toBe(100);
        expect(metadata.heightMm).toBe(50);
    });

    it('extracts metadata from Cura G-code', () => {
        const content = `
;MATERIAL:PLA
;Layer height: 0.2
;TIME:5025
;Filament weight = 12.34
    `;
        const metadata = parseGCode(content);

        expect(metadata.material).toBe('PLA');
        expect(metadata.layerHeightMm).toBe(0.2);
        expect(metadata.estimatedTime).toBe(5025);
        expect(metadata.filamentGrams).toBe(12.34);
    });

    it('handles partial metadata', () => {
        const content = `
; filament_type = PETG
    `;
        const metadata = parseGCode(content);

        expect(metadata.material).toBe('PETG');
        expect(metadata.layerHeightMm).toBeUndefined();
    });
});

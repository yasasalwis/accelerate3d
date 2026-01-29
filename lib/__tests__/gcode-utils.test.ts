import {injectEjectGcode} from '../gcode-utils';
import fs from 'fs';
import path from 'path';

// Revert to using spies - relying on scheduler.test.ts using isolated mocks so it doesn't interfere

describe('injectEjectGcode', () => {
    const mockOriginalPath = '/path/to/original.gcode';
    const mockEjectGcode = 'M104 S0 ; turn off temperature\nG28 X0  ; home X axis';
    // const mockTempDir = '/path/to/tmp';

    beforeAll(() => {
        jest.spyOn(fs, 'existsSync');
        jest.spyOn(fs, 'mkdirSync');
        jest.spyOn(fs, 'writeFileSync');
        jest.spyOn(fs, 'readFileSync');

        jest.spyOn(path, 'join');
        jest.spyOn(path, 'basename');
        jest.spyOn(process, 'cwd');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
        (path.basename as jest.Mock).mockReturnValue('original.gcode');
        (process.cwd as jest.Mock).mockReturnValue('/app');

        // Default mocks
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.mkdirSync as jest.Mock).mockImplementation(() => {
        });
        (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        });
    });

    it('throws error if original file does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        expect(() => injectEjectGcode(mockOriginalPath, mockEjectGcode)).toThrow(
            `Original G-code file not found: ${mockOriginalPath}`
        );
    });

    it('replaces standard end script with eject gcode', () => {
        const originalContent = `
G1 X10 Y10
M104 S0 ; turn off temperature
M140 S0 ; turn off heatbed
G28 X0  ; home X axis
M84     ; disable motors
`;
        (fs.readFileSync as jest.Mock).mockReturnValue(originalContent);

        injectEjectGcode(mockOriginalPath, mockEjectGcode);

        const expectedContent = expect.stringContaining('; --- START INJECTED EJECT GCODE (REPLACED STANDARD END) ---');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('injected-'),
            expectedContent,
            'utf-8'
        );
    });

    it('inserts before M84 if standard end script not found', () => {
        const originalContent = `
G1 X10 Y10
M84 ; disable motors
`;
        (fs.readFileSync as jest.Mock).mockReturnValue(originalContent);

        injectEjectGcode(mockOriginalPath, mockEjectGcode);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('injected-'),
            expect.stringContaining('; --- START INJECTED EJECT GCODE ---'),
            'utf-8'
        );
    });

    it('appends to end if M84 not found', () => {
        const originalContent = `
G1 X10 Y10
`;
        (fs.readFileSync as jest.Mock).mockReturnValue(originalContent);

        injectEjectGcode(mockOriginalPath, mockEjectGcode);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('injected-'),
            expect.stringContaining('; --- START INJECTED EJECT GCODE ---'),
            'utf-8'
        );
    });
});

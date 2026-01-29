import {processPendingJobs} from '../scheduler';
import {db} from '../db';
import {getPrinterClient} from '../printer-client';
import fs from 'fs';

// Mock dependencies
jest.mock('../db', () => ({
    db: {
        userPrinter: {
            findMany: jest.fn(),
            update: jest.fn(),
        },
        printJob: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn((args) => Promise.all(args)),
    },
}));

jest.mock('../printer-client', () => {
    class MockMoonrakerClient {
    }

    class MockMqttPrinterClient {
    }

    return {
        getPrinterClient: jest.fn(),
        detectPrinterProtocol: jest.fn(),
        MoonrakerClient: MockMoonrakerClient,
        MqttPrinterClient: MockMqttPrinterClient,
    };
});
jest.mock('../gcode-utils', () => ({
    injectEjectGcode: jest.fn(),
}));

jest.mock('fs', () => {
    const mock = {
        existsSync: jest.fn(),
        readFileSync: jest.fn(),
        unlinkSync: jest.fn(),
        mkdirSync: jest.fn(),
        writeFileSync: jest.fn(),
    };
    return {...mock, default: mock};
});

jest.mock('../notification-service', () => ({
    NotificationEvents: new Proxy({}, {
        get: () => jest.fn()
    }),
    createNotificationFromEvent: jest.fn(),
    createNotification: jest.fn(),
}));


describe('Scheduler: processPendingJobs', () => {
    const mockDb = db as unknown as {
        userPrinter: { findMany: jest.Mock, update: jest.Mock },
        printJob: { findMany: jest.Mock, findUnique: jest.Mock, update: jest.Mock },
        $transaction: jest.Mock
    };

    const mockGetPrinterClient = getPrinterClient as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        // Default mocks to prevent crashes
        mockDb.userPrinter.findMany.mockResolvedValue([]);
        mockDb.printJob.findMany.mockResolvedValue([]);
    });

    describe('Monitoring Active Prints', () => {
        it('completes job when printer becomes IDLE', async () => {
            // Setup: 1 active printer
            mockDb.userPrinter.findMany.mockResolvedValueOnce([
                {
                    id: 'printer1',
                    status: 'PRINTING',
                    currentJobId: 'job1',
                    name: 'Printer 1',
                    ipAddress: '192.168.1.100',
                    protocol: 'MOONRAKER'
                }
            ])
                // Setup: candidate printers (empty) - need to queue this specifically if not using default
                .mockResolvedValueOnce([]);

            // Setup: printer client returns IDLE
            const mockClient = {
                getStatus: jest.fn().mockResolvedValue({state: 'IDLE', printDuration: 100, totalDuration: 100})
            };
            mockGetPrinterClient.mockResolvedValue(mockClient);

            // Execute
            const results = await processPendingJobs();

            // Verify
            expect(mockDb.printJob.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {id: 'job1'},
                data: expect.objectContaining({status: 'COMPLETED'})
            }));
            expect(mockDb.userPrinter.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {id: 'printer1'},
                data: expect.objectContaining({status: 'IDLE', currentJobId: null})
            }));
        });
    });

    describe('Starting Pending Jobs', () => {
        it('starts pending job on IDLE printer', async () => {
            // Setup: Active prints (none)
            mockDb.userPrinter.findMany.mockResolvedValueOnce([]);

            // Setup: Candidate printers (1 IDLE with 1 Pending Job)
            mockDb.userPrinter.findMany.mockResolvedValueOnce([
                {
                    id: 'printer1',
                    status: 'IDLE',
                    name: 'Printer 1',
                    ipAddress: '192.168.1.100',
                    protocol: 'MOONRAKER',
                    jobs: [{id: 'job2', status: 'PENDING'}],
                    printer: {buildVolumeX: 200, buildVolumeY: 200, buildVolumeZ: 200}
                }
            ]);

            // Setup: Printer client returns IDLE and methods
            const mockClient = {
                getStatus: jest.fn().mockResolvedValue({state: 'IDLE'}),
                uploadAndPrint: jest.fn().mockResolvedValue(true)
            };
            mockGetPrinterClient.mockResolvedValue(mockClient);

            // Setup: Job details
            mockDb.printJob.findUnique.mockResolvedValue({
                id: 'job2',
                model: {gcodePath: '/path/to/model.gcode'}
            });

            // Execute
            await processPendingJobs();

            // Verify
            expect(mockClient.uploadAndPrint).toHaveBeenCalled();
            expect(mockDb.printJob.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {id: 'job2'},
                data: expect.objectContaining({status: 'PRINTING'})
            }));
            expect(mockDb.userPrinter.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {id: 'printer1'},
                data: expect.objectContaining({status: 'PRINTING', currentJobId: 'job2'})
            }));
        });
    });
});

import mqtt from 'mqtt';
import fs from 'fs';

export type PrinterStatus = {
    state: 'IDLE' | 'PRINTING' | 'PAUSED' | 'ERROR' | 'OFFLINE';
    temps?: { bed: number; nozzle: number };
    filename?: string | null;
    progress?: number;
    printDuration?: number;
    totalDuration?: number;
}

export interface PrinterClient {
    uploadAndPrint(filePath: string, filename: string): Promise<void>;

    getStatus(): Promise<PrinterStatus>;
}

export class MoonrakerClient implements PrinterClient {
    private ip: string;

    constructor(ip: string) {
        this.ip = ip;
    }

    private get baseUrl() {
        return `http://${this.ip}`;
    }

    async getStatus(): Promise<PrinterStatus> {
        try {
            // Check Moonraker 'objects/query' for printer state
            const res = await fetch(`${this.baseUrl}/printer/objects/query?print_stats&extruder&heater_bed`, {signal: AbortSignal.timeout(5000)});
            if (!res.ok) throw new Error(`Moonraker check failed: ${res.status}`);
            const data = await res.json();

            // Safety check for data structure
            if (!data.result || !data.result.status) {
                throw new Error("Invalid Moonraker response format");
            }

            const stats = data.result.status.print_stats;
            const bed = data.result.status.heater_bed;
            const extruder = data.result.status.extruder;

            let state: PrinterStatus['state'] = 'IDLE';
            if (stats.state === 'printing') state = 'PRINTING';
            if (stats.state === 'paused') state = 'PAUSED';
            if (stats.state === 'error') state = 'ERROR';

            return {
                state,
                temps: {
                    bed: bed?.temperature || 0,
                    nozzle: extruder?.temperature || 0
                },
                filename: stats.filename,
                progress: stats.total_duration > 0 ? (stats.print_duration / stats.total_duration) * 100 : 0,
                printDuration: stats.print_duration,
                totalDuration: stats.total_duration
            };
        } catch (e: unknown) {
            const error = e as Error & { name?: string };
            // Silence timeout errors to avoid log spam
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                // console.warn(`Moonraker check timed out for ${this.ip}`);
            } else {
                console.error(`Moonraker status check failed for ${this.ip}`, error.message);
            }
            return {state: 'OFFLINE'};
        }
    }

    async uploadAndPrint(filePath: string, filename: string): Promise<void> {
        const buffer = fs.readFileSync(filePath);
        const blob = new Blob([buffer]);
        const formData = new FormData();
        formData.append('file', blob, filename);

        const uploadRes = await fetch(`${this.baseUrl}/server/files/upload`, {
            method: 'POST',
            body: formData
        });

        if (!uploadRes.ok) {
            const err = await uploadRes.text();
            throw new Error(`Failed to upload file to Moonraker: ${err}`);
        }

        const printRes = await fetch(`${this.baseUrl}/printer/print/start?filename=${encodeURIComponent(filename)}`, {
            method: 'POST'
        });

        if (!printRes.ok) {
            const err = await printRes.text();
            throw new Error(`Failed to start print on Moonraker: ${err}`);
        }
    }
}

export class MqttPrinterClient implements PrinterClient {
    private ip: string;

    constructor(ip: string) {
        this.ip = ip;
    }

    async getStatus(): Promise<PrinterStatus> {
        return new Promise((resolve) => {
            const client = mqtt.connect(`mqtt://${this.ip}`, {connectTimeout: 5000});
            let resolved = false;

            const finish = (status: PrinterStatus) => {
                if (resolved) return;
                resolved = true;
                client.end();
                resolve(status);
            };

            client.on('connect', () => {
                // Connected to broker, assume Online but unknown state for generic MQTT
                finish({state: 'IDLE', temps: {bed: 0, nozzle: 0}, printDuration: 0, totalDuration: 0});
            });

            client.on('error', () => {
                finish({state: 'OFFLINE'});
            });

            client.on('offline', () => {
                finish({state: 'OFFLINE'});
            });

            setTimeout(() => {
                finish({state: 'OFFLINE'});
            }, 5000);
        });
    }

    async uploadAndPrint(_filePath: string, _filename: string): Promise<void> {
        throw new Error("G-code upload via MQTT is not supported. Please ensure Moonraker HTTP API is accessible.");
    }
}

export async function detectPrinterProtocol(ip: string): Promise<'MOONRAKER' | 'MQTT' | null> {
    try {
        const client = new MoonrakerClient(ip);
        const status = await client.getStatus();
        if (status.state !== 'OFFLINE') return 'MOONRAKER';
    } catch {
    }

    try {
        const client = new MqttPrinterClient(ip);
        const status = await client.getStatus();
        if (status.state !== 'OFFLINE') return 'MQTT';
    } catch {
    }

    return null;
}

export async function getPrinterClient(ip: string, protocol?: string): Promise<PrinterClient> {
    let proto = protocol;
    if (!proto || proto === 'UNKNOWN') {
        const detected = await detectPrinterProtocol(ip);
        if (detected) proto = detected;
    }

    if (proto === 'MOONRAKER') {
        return new MoonrakerClient(ip);
    } else if (proto === 'MQTT' || proto === 'BAMBU_MQTT') {
        return new MqttPrinterClient(ip);
    } else {
        return new MoonrakerClient(ip);
    }
}

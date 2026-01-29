import mqtt from "mqtt"

type PrinterProtocol = "MOONRAKER" | "MQTT" | "UNKNOWN"

interface PrinterStatus {
    status: string // "IDLE", "PRINTING", "ERROR", etc.
    nozzleTemp?: number
    bedTemp?: number
    progress?: number
    filename?: string
}

/**
 * Attempts to detect the protocol used by a printer at the given IP or URL.
 */
export async function detectPrinterProtocol(input: string): Promise<PrinterProtocol> {
    const { host, port, protocol } = parseConnectionInput(input)

    // 1. If explicit protocol provided in URL (e.g., http://...), favor that check first or exclusively?
    // For simplicity, if it looks like an HTTP URL, check Moonraker. If mqtt://, check MQTT.
    // If just IP, check both.

    let shouldCheckMoonraker = true
    let shouldCheckMqtt = true

    if (protocol === 'http:' || protocol === 'https:') shouldCheckMqtt = false
    if (protocol === 'mqtt:' || protocol === 'mqtts:') shouldCheckMoonraker = false

    if (shouldCheckMoonraker) {
        // Try Moonraker (Standard port 7125, Proxy port 80, or the explicit port from URL)
        const ports = port ? [parseInt(port)] : [7125, 80]

        for (const p of ports) {
            try {
                const controller = new AbortController()
                const id = setTimeout(() => controller.abort(), 2000)

                // Construct URL properly
                const baseUrl = protocol?.startsWith('http') ? input : `http://${host}:${p}`
                // If input was a full URL with path, we might need to be careful, but usually it's just base.
                // We'll strip path for detection if possible, or append /printer/info

                // Cleaner approach: Use URL object if input is full URL, else construct.
                let targetUrl = ""
                try {
                    const u = new URL(baseUrl)
                    u.pathname = "/printer/info"
                    targetUrl = u.toString()
                } catch {
                    targetUrl = `http://${host}:${p}/printer/info`
                }

                const res = await fetch(targetUrl, { signal: controller.signal })
                clearTimeout(id)

                if (res.ok) {
                    console.log(`Detected Moonraker on ${targetUrl}`)
                    return "MOONRAKER"
                }
            } catch (_e) {
                // Ignore
            }
        }
    }

    if (shouldCheckMqtt) {
        try {
            // Use provided port or default 1883
            const targetHost = protocol?.startsWith('mqtt') ? input : `mqtt://${host}${port ? ':' + port : ''}`
            const isMqtt = await checkMqtt(targetHost)
            if (isMqtt) return "MQTT"
        } catch (_e) {
            // Ignore
        }
    }

    return "UNKNOWN"
}

function parseConnectionInput(input: string) {
    // Basic parsing to separate explicit protocol/port if present
    // If input is "192.168.1.1", url parser might fail or treat as path.
    // We add a dummy protocol if none exists to use URL parser, or Regex.

    if (!input.includes('://')) {
        // Assume raw IP or Hostname
        // Check for port
        const [h, p] = input.split(':')
        return { host: h, port: p, protocol: null }
    }

    try {
        const u = new URL(input)
        return { host: u.hostname, port: u.port, protocol: u.protocol }
    } catch {
        return { host: input, port: null, protocol: null }
    }
}

function checkMqtt(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const client = mqtt.connect(url, {
            connectTimeout: 2000,
            reconnectPeriod: 0
        })

        client.on("connect", () => {
            client.end()
            resolve(true)
        })

        client.on("error", () => {
            client.end()
            resolve(false)
        })

        setTimeout(() => {
            if (client.connected) return
            client.end()
            resolve(false)
        }, 2500)
    })
}

/**
 * Fetches status based on the known protocol.
 */
export async function getPrinterStatus(input: string, protocol: string): Promise<PrinterStatus> {
    if (protocol === "MOONRAKER") {
        return getMoonrakerStatus(input)
    } else if (protocol === "MQTT") {
        return getMqttStatus(input)
    }
    return { status: "OFFLINE" }
}

async function getMqttStatus(input: string): Promise<PrinterStatus> {
    const { host, port } = parseConnectionInput(input)
    const brokerUrl = `mqtt://${host}${port ? ':' + port : ''}`

    return new Promise((resolve) => {
        const client = mqtt.connect(brokerUrl, {
            connectTimeout: 3000,
            reconnectPeriod: 0
        })

        let resolved = false
        const finish = (status: PrinterStatus) => {
            if (resolved) return
            resolved = true
            client.end()
            resolve(status)
        }

        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
            finish({ status: "OFFLINE" })
        }, 5000)

        client.on("connect", () => {
            // Subscribe to common 3D printer MQTT topics
            // BambuLab printers use: device/{serial}/report
            // Generic printers may use various topic structures
            client.subscribe([
                "device/+/report",      // BambuLab
                "+/status",             // Generic
                "+/telemetry",          // Generic
                "printer/+/status",     // Common pattern
            ], (err) => {
                if (err) {
                    clearTimeout(timeout)
                    finish({ status: "ONLINE" })
                }
            })
        })

        client.on("message", (_topic, message) => {
            clearTimeout(timeout)
            try {
                const data = JSON.parse(message.toString())
                const status = parseMqttPrinterData(data)
                finish(status)
            } catch {
                // If message isn't JSON, just confirm online
                finish({ status: "ONLINE" })
            }
        })

        client.on("error", () => {
            clearTimeout(timeout)
            finish({ status: "OFFLINE" })
        })
    })
}

function parseMqttPrinterData(data: Record<string, unknown>): PrinterStatus {
    // BambuLab printer data structure
    if (data.print && typeof data.print === 'object') {
        const print = data.print as Record<string, unknown>
        let status = "IDLE"

        // BambuLab uses gcode_state: IDLE, RUNNING, PAUSE, FINISH, FAILED
        const gcodeState = print.gcode_state as string
        if (gcodeState === 'RUNNING') status = "PRINTING"
        else if (gcodeState === 'PAUSE') status = "PAUSED"
        else if (gcodeState === 'FAILED') status = "ERROR"
        else if (gcodeState === 'FINISH') status = "IDLE"

        return {
            status,
            nozzleTemp: typeof print.nozzle_temper === 'number' ? print.nozzle_temper : undefined,
            bedTemp: typeof print.bed_temper === 'number' ? print.bed_temper : undefined,
            progress: typeof print.mc_percent === 'number' ? print.mc_percent : undefined,
            filename: typeof print.gcode_file === 'string' ? print.gcode_file : undefined
        }
    }

    // Generic MQTT printer data - try common field names
    let status = "ONLINE"
    const state = (data.state || data.status || data.printer_state) as string | undefined

    if (state) {
        const stateLower = state.toLowerCase()
        if (stateLower.includes('print') || stateLower === 'running') status = "PRINTING"
        else if (stateLower.includes('pause')) status = "PAUSED"
        else if (stateLower.includes('error') || stateLower.includes('fail')) status = "ERROR"
        else if (stateLower.includes('idle') || stateLower.includes('ready')) status = "IDLE"
    }

    return {
        status,
        nozzleTemp: typeof data.nozzle_temp === 'number' ? data.nozzle_temp :
            typeof data.hotend_temp === 'number' ? data.hotend_temp : undefined,
        bedTemp: typeof data.bed_temp === 'number' ? data.bed_temp :
            typeof data.heated_bed === 'number' ? data.heated_bed : undefined,
        progress: typeof data.progress === 'number' ? data.progress :
            typeof data.print_progress === 'number' ? data.print_progress : undefined,
        filename: typeof data.filename === 'string' ? data.filename :
            typeof data.current_file === 'string' ? data.current_file : undefined
    }
}

async function getMoonrakerStatus(input: string): Promise<PrinterStatus> {
    try {
        const { host, port, protocol } = parseConnectionInput(input)

        // Determine correct base URL
        // If the user provided a specific URL/Port that worked during detection, we should ideally use that.
        // But we don't store the "detected port", only the "protocol". 
        // We might need to re-probe or assume standard ports if none provided.
        // If the User provided `http://myprinter:1234`, we use it.
        // If User provided `192.168.1.1`, we try 7125 then 80 (same strategy as detection)

        let targetUrl: string

        if (port || protocol?.startsWith('http')) {
            // User provided specific entry point
            const u = new URL(input.includes('://') ? input : `http://${input}`)
            // We need to append the query path
            // Moonraker status path: /printer/objects/query...
            // Ensure no double slash if input had trailing slash
            const base = u.origin
            targetUrl = `${base}/printer/objects/query?print_stats&extruder&heater_bed&display_status`
        } else {
            // Raw IP/Host, probe standard ports
            let base = `http://${host}:7125`
            if (!await isPortOpen(base)) {
                base = `http://${host}:80`
            }
            targetUrl = `${base}/printer/objects/query?print_stats&extruder&heater_bed&display_status`
        }

        const res = await fetch(targetUrl, {
            signal: AbortSignal.timeout(3000)
        })

        if (!res.ok) throw new Error("Moonraker status fetch failed")

        const data = await res.json()
        const stats = data.result.status

        let status = "IDLE"
        const state = stats.print_stats.state
        if (state === "printing") status = "PRINTING"
        else if (state === "paused") status = "PAUSED"
        else if (state === "error") status = "ERROR"

        return {
            status,
            nozzleTemp: stats.extruder?.temperature,
            bedTemp: stats.heater_bed?.temperature,
            progress: stats.display_status?.progress,
            filename: stats.print_stats?.filename
        }

    } catch (e) {
        console.error(`Failed to get Moonraker status for ${input}:`, e)
        return { status: "OFFLINE" }
    }
}

async function isPortOpen(baseUrl: string): Promise<boolean> {
    try {
        const u = new URL(baseUrl)
        u.pathname = "/printer/info"
        await fetch(u.toString(), { method: 'HEAD', signal: AbortSignal.timeout(1000) })
        return true
    } catch {
        return false
    }
}

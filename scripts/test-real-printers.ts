
import { detectPrinterProtocol, getPrinterStatus } from "../lib/printer-network"
import { db } from "../lib/db"

async function run() {
    console.log("Starting Real Printer Verification...")

    // 1. Check DB for printers
    const printers = await db.userPrinter.findMany()
    console.log(`Found ${printers.length} printers in database.`)

    for (const p of printers) {
        console.log(`\nChecking Printer: ${p.name} (${p.ipAddress})`)
        try {
            const protocol = await detectPrinterProtocol(p.ipAddress)
            console.log(`> Detected Protocol: ${protocol}`)

            if (protocol !== "UNKNOWN") {
                const status = await getPrinterStatus(p.ipAddress, protocol)
                console.log(`> Status: ${status.status}`)
                if (status.status === "PRINTING") {
                    console.log(`> Progress: ${status.progress}%`)
                }
            }
        } catch (e: any) {
            console.error(`> Error: ${e.message}`)
        }
    }

    // 2. Allow manual check from args
    const manualTarget = process.argv[2]
    if (manualTarget) {
        console.log(`\nChecking Manual Target: ${manualTarget}`)
        try {
            const protocol = await detectPrinterProtocol(manualTarget)
            console.log(`> Detected Protocol: ${protocol}`)
            if (protocol !== "UNKNOWN") {
                const status = await getPrinterStatus(manualTarget, protocol)
                console.log(`> Status: ${status.status}`)
            }
        } catch (e: any) {
            console.error(`> Error: ${e.message}`)
        }
    }
}

run().catch(console.error)

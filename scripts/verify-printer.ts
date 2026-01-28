
import { detectPrinterProtocol } from "../lib/printer-network"

// Mock fetch
global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    const sUrl = url.toString()
    console.log(`[MockFetch] ${sUrl}`)

    // IP with standard port
    if (sUrl.includes("192.168.1.100") && sUrl.includes(":7125")) {
        return {
            ok: true,
            json: async () => ({ result: "Moonraker Mock" })
        } as Response
    }

    // URL with specific port
    if (sUrl.includes("myprinter.local") && sUrl.includes(":8080")) {
        return {
            ok: true,
            json: async () => ({ result: "Moonraker Mock Custom Port" })
        } as Response
    }

    // HTTP URL
    if (sUrl.startsWith("http://custom-url.com") && sUrl.includes("/printer/info")) {
        return {
            ok: true,
            json: async () => ({ result: "Moonraker Mock HTTP" })
        } as Response
    }

    throw new Error("Connection Refused")
}

async function run() {
    console.log("Starting Verification...")

    // Test 1: Standard IP (Moonraker detection logic remains same)
    console.log("\nTest 1: Standard IP 192.168.1.100")
    if ((await detectPrinterProtocol("192.168.1.100")) === "MOONRAKER") {
        console.log("PASS: Standard IP")
    } else {
        console.error("FAIL: Standard IP")
    }

    // Test 2: Hostname with Custom Port
    console.log("\nTest 2: Hostname with Port myprinter.local:8080")
    // Note: Our logic tries provided port if present
    if ((await detectPrinterProtocol("myprinter.local:8080")) === "MOONRAKER") {
        console.log("PASS: Custom Port")
    } else {
        console.error("FAIL: Custom Port")
    }

    // Test 3: Full URL 
    console.log("\nTest 3: Full URL http://custom-url.com")
    if ((await detectPrinterProtocol("http://custom-url.com")) === "MOONRAKER") {
        console.log("PASS: Full URL")
    } else {
        console.error("FAIL: Full URL")
    }

    // Test 4: Unknown
    console.log("\nTest 4: Unknown 192.168.1.99")
    if ((await detectPrinterProtocol("192.168.1.99")) === "UNKNOWN") {
        console.log("PASS: Unknown")
    } else {
        console.error("FAIL: Unknown")
    }
}

run().catch(console.error)

import { db } from "../lib/db";

async function main() {
    // 1. Get a user
    const user = await db.user.findFirst();
    if (!user) {
        console.error("No user found. Please run the app and register first.");
        return;
    }

    // 2. Get a market printer
    const printer = await db.printer.findFirst();
    if (!printer) {
        console.error("No printers found in database. Seeding a default one...");
        const newPrinter = await db.printer.create({
            data: {
                make: "Prusa",
                model: "MK4",
                technology: "FDM",
                buildVolumeX: 250,
                buildVolumeY: 210,
                buildVolumeZ: 220,
            }
        });
        Object.assign(printer || {}, newPrinter);
    }

    const targetPrinter = printer || await db.printer.findFirst();

    // 3. Create a UserPrinter with an API Key
    const userPrinter = await db.userPrinter.upsert({
        where: { userId_printerId: { userId: user.id, printerId: targetPrinter!.id } },
        update: {
            apiKey: "test-slicer-key-123",
            name: "Test Lab Prusa",
            ipAddress: "192.168.1.100"
        },
        create: {
            userId: user.id,
            printerId: targetPrinter!.id,
            apiKey: "test-slicer-key-123",
            name: "Test Lab Prusa",
            ipAddress: "192.168.1.100",
            status: "IDLE"
        }
    });

    console.log("Test printer created/updated:");
    console.log(`Name: ${userPrinter.name}`);
    console.log(`API Key: ${userPrinter.apiKey}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect());

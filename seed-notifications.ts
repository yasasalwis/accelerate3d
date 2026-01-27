import {db} from "./lib/db";

async function main() {
    const user = await db.user.findFirst();
    if (!user) {
        console.error("No user found. Please seed users first.");
        return;
    }

    const notifications = [
        {
            userId: user.id,
            title: "System Online",
            message: "Accelerate3D fleet management system is now active and monitoring 4 printers.",
            type: "SUCCESS",
        },
        {
            userId: user.id,
            title: "Filament Low",
            message: "Printer 'Voron-01' is at 5% filament. Please replace soon.",
            type: "WARNING",
        },
        {
            userId: user.id,
            title: "Print Completed",
            message: "Job 'Benchy_v3' finished successfully on 'Ender-3 Neo'.",
            type: "INFO",
        },
    ];

    for (const n of notifications) {
        await db.notification.create({
            data: n,
        });
    }

    console.log("Seeded notifications successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

import {db} from "./db";
import {getPrinterClient, MoonrakerClient} from "./printer-client";
import path from "path";
import fs from "fs";
import {injectEjectGcode} from "./gcode-utils";

export async function processPendingJobs() {
    console.log("Starting Scheduler: processPendingJobs...");
    const results = {
        checkedPrinters: 0,
        jobsStarted: 0,
        errors: 0,
        logs: [] as string[]
    };

    try {
        // --- 1. MONITOR ACTIVE PRINTS ---
        console.log("Checking active prints...");
        const activePrinters = await db.userPrinter.findMany({
            where: {status: "PRINTING"},
            include: {user: true} // Fetch user if needed for notifications
        });

        for (const printer of activePrinters) {
            if (!printer.currentJobId) {
                // Inconsistent state: Internal status is PRINTING but no job linked. Reset.
                await db.userPrinter.update({
                    where: {id: printer.id},
                    data: {status: "IDLE"}
                });
                continue;
            }

            try {
                const client = await getPrinterClient(printer.ipAddress, printer.protocol);
                const status = await client.getStatus();

                if (status.state === 'OFFLINE') {
                    // Printer went offline. Update status and notify.
                    results.logs.push(`Printer ${printer.name} is OFFLINE during print.`);

                    if (printer.status !== 'OFFLINE') {
                        await db.userPrinter.update({
                            where: {id: printer.id},
                            data: {status: 'OFFLINE'}
                        });

                        await db.notification.create({
                            data: {
                                userId: printer.userId,
                                title: "Printer Disconnected",
                                message: `Printer "${printer.name}" went offline during a print job.`,
                                type: "ERROR"
                            }
                        });
                    }
                    continue;
                }

                if (status.state === 'IDLE') {
                    // Printer finished (success or fail).
                    const printDuration = status.printDuration || 0;
                    const totalDuration = status.totalDuration || 0;

                    // SAFEGUARD: If durations are 0, it might be warming up or just finished instantly.
                    if (totalDuration === 0 && printDuration === 0) {
                        results.logs.push(`Printer ${printer.name} is IDLE but duration is 0. Assuming warming up.`);
                        continue;
                    }

                    let jobStatus = "COMPLETED"; // Default to success

                    if (totalDuration > 0 && printDuration < totalDuration) {
                        // It stopped before finishing
                        jobStatus = "FAILED";
                        results.logs.push(`Printer ${printer.name} finished early. Marked as FAILED.`);
                    } else {
                        results.logs.push(`Printer ${printer.name} finished successfully.`);
                    }

                    // Complete the job
                    await db.$transaction([
                        db.printJob.update({
                            where: {id: printer.currentJobId},
                            data: {
                                status: jobStatus,
                                endTime: new Date()
                            }
                        }),
                        db.userPrinter.update({
                            where: {id: printer.id},
                            data: {
                                status: "IDLE",
                                currentJobId: null
                            }
                        })
                    ]);
                }
                // If still PRINTING or PAUSED, do nothing.

            } catch (err: unknown) {
                const error = err as Error;
                console.error(`Error monitoring printer ${printer.name}:`, error);
            }
        }


        // --- 2. START PENDING JOBS (AND RECOVERY) ---
        // Find IDLE, OFFLINE, or UNKNOWN printers to see if they can take jobs
        const candidatePrinters = await db.userPrinter.findMany({
            where: {
                status: {in: ["IDLE", "OFFLINE", "UNKNOWN"]}
            },
            include: {
                jobs: {
                    where: {status: "PENDING"},
                    orderBy: {createdAt: 'asc'},
                    take: 1
                },
                printer: true // To get model/make if needed
            }
        });

        results.checkedPrinters = candidatePrinters.length;

        for (const userPrinter of candidatePrinters) {
            let nextJob = userPrinter.jobs[0];
            let isWorkStealing = false;

            try {
                const client = await getPrinterClient(userPrinter.ipAddress, userPrinter.protocol);
                const status = await client.getStatus();

                // Update DB status if it changed (e.g. was OFFLINE, now IDLE)
                if (status.state !== 'OFFLINE' && userPrinter.status !== 'PRINTING' && userPrinter.status !== status.state) {
                    await db.userPrinter.update({
                        where: {id: userPrinter.id},
                        data: {status: status.state, lastSeen: new Date()}
                    });
                }

                if (status.state === 'OFFLINE') {
                    if (userPrinter.status !== 'OFFLINE') {
                        await db.userPrinter.update({where: {id: userPrinter.id}, data: {status: 'OFFLINE'}});

                        await db.notification.create({
                            data: {
                                userId: userPrinter.userId,
                                title: "Printer Offline",
                                message: `Printer "${userPrinter.name}" is unreachable.`,
                                type: "WARNING"
                            }
                        });
                    }
                    results.logs.push(`Printer ${userPrinter.name} is OFFLINE.`);
                    continue;
                }

                if (status.state === 'PRINTING' || status.state === 'PAUSED') {
                    if (userPrinter.status !== status.state) {
                        await db.userPrinter.update({
                            where: {id: userPrinter.id},
                            data: {status: status.state, lastSeen: new Date()}
                        });
                    }
                    results.logs.push(`Printer ${userPrinter.name} is BUSY (${status.state}).`);
                    continue;
                }

                if (status.state === 'ERROR') {
                    results.logs.push(`Printer ${userPrinter.name} is in ERROR state.`);
                    continue;
                }

                // If we are here, printer is physically IDLE and ready.

                // 2.2 WORK STEALING
                // If no job assigned specifically to this printer, look for ONE from the global pool (same user)
                if (!nextJob) {
                    // Find oldest pending job for this user that fits this printer
                    // Note: This is a simple implementation. For high scale, use raw SQL or optimized queries.
                    const pendingJobs = await db.printJob.findMany({
                        where: {
                            status: 'PENDING',
                            userPrinter: {userId: userPrinter.userId}
                        },
                        orderBy: {createdAt: 'asc'},
                        include: {model: true},
                        take: 10 // Look at top 10 to find a fit
                    });

                    for (const job of pendingJobs) {
                        // Check dimensions
                        if (userPrinter.printer.buildVolumeX >= job.model.widthMm &&
                            userPrinter.printer.buildVolumeY >= job.model.depthMm &&
                            userPrinter.printer.buildVolumeZ >= job.model.heightMm) {

                            // Found a stealable job!
                            isWorkStealing = true;
                            nextJob = job; // Use this job
                            break;
                        }
                    }
                }

                if (!nextJob) {
                    // Still no job
                    continue;
                }

                // ... Proceed to upload ...

                // Fetch full job details if we don't have model (if not stolen)
                let gcodePath = "";
                // Use the one we found, need safe access.
                const fullJob = await db.printJob.findUnique({where: {id: nextJob.id}, include: {model: true}});
                if (!fullJob || !fullJob.model.gcodePath) {
                    console.error(`Job ${nextJob.id} has no G-code path. Marking FAILED.`);
                    await db.printJob.update({where: {id: nextJob.id}, data: {status: "FAILED"}});
                    results.errors++;
                    continue;
                }
                gcodePath = fullJob.model.gcodePath;


                let fsPath = gcodePath;
                if (gcodePath.startsWith("/models")) {
                    fsPath = path.join(process.cwd(), "public", gcodePath);
                } else if (!path.isAbsolute(gcodePath)) {
                    // Fallback for relative paths, assume public
                    fsPath = path.join(process.cwd(), "public", gcodePath);
                }

                // Verify file exists
                if (!fs.existsSync(fsPath)) {
                    console.error(`G-code file not found at ${fsPath}. Marking FAILED.`);
                    await db.printJob.update({where: {id: nextJob.id}, data: {status: "FAILED"}});
                    results.errors++;
                    continue;
                }

                const filename = path.basename(fsPath);

                // INJECTION LOGIC
                let fileToUpload = fsPath;
                let isTempFile = false; // Flag to clean up later

                if (userPrinter.ejectGcode) {
                    try {
                        console.log(`Injecting eject G-code for printer ${userPrinter.name}...`);
                        fileToUpload = injectEjectGcode(fsPath, userPrinter.ejectGcode);
                        isTempFile = true;
                    } catch (injectErr) {
                        console.error(`Failed to inject G-code for printer ${userPrinter.name}:`, injectErr);
                        // Fallback to original file? Or fail? 
                        // Let's fallback to original but log error
                        results.logs.push(`G-code injection failed, using original file: ${injectErr}`);
                    }
                }

                await client.uploadAndPrint(fileToUpload, filename);

                // Clean up temp file
                if (isTempFile) {
                    try {
                        fs.unlinkSync(fileToUpload);
                    } catch (e) {
                        console.error("Failed to delete temp G-code file:", e);
                    }
                }

                // Update DB
                await db.$transaction([
                    db.printJob.update({
                        where: {id: nextJob.id},
                        data: {
                            status: "PRINTING",
                            startTime: new Date(),
                            userPrinterId: userPrinter.id // Re-assign if stolen
                        }
                    }),
                    db.userPrinter.update({
                        where: {id: userPrinter.id},
                        data: {
                            status: "PRINTING",
                            currentJobId: nextJob.id,
                            protocol: (client instanceof MoonrakerClient) ? 'MOONRAKER' : 'MQTT',
                            lastSeen: new Date()
                        }
                    })
                ]);

                results.jobsStarted++;
                const stolenText = isWorkStealing ? " (STOLEN)" : "";
                results.logs.push(`Started job ${nextJob.id}${stolenText} on printer ${userPrinter.name} (${userPrinter.ipAddress})`);

            } catch (err: unknown) {
                const error = err as Error;
                console.error(`Failed to process job for printer ${userPrinter.name}:`, error);
                results.errors++;
                results.logs.push(`Error on printer ${userPrinter.name}: ${error.message}`);

                // CRITICAL FIX: IF WE FAILED TO START, MARK JOB AS FAILED TO PREVENT LOOPS
                if (nextJob) {
                    try {
                        await db.printJob.update({
                            where: {id: nextJob.id},
                            data: {status: "FAILED"}
                        });
                        results.logs.push(`Marked job ${nextJob.id} as FAILED due to start error.`);
                    } catch (dbErr) {
                        console.error("Failed to mark job as failed:", dbErr);
                    }
                }
            }
        }

    } catch (globalErr: unknown) {
        const error = globalErr as Error;
        console.error("Scheduler global error:", error);
        results.errors++;
        results.logs.push(`Global Scheduler Error: ${error.message}`);
    }

    return results;
}

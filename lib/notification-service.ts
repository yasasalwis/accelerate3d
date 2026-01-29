import {db} from "./db"
import {NotificationType} from "@/types/notification"

/**
 * Notification events for consistent messaging across the application
 */
export const NotificationEvents = {
    // Print Job Events
    PRINT_STARTED: (printerName: string, jobName: string) => ({
        type: "INFO" as NotificationType,
        title: "Print Started",
        message: `Print job "${jobName}" started on ${printerName}`
    }),
    PRINT_COMPLETED: (printerName: string, jobName: string) => ({
        type: "SUCCESS" as NotificationType,
        title: "Print Completed",
        message: `Print job "${jobName}" completed successfully on ${printerName}`
    }),
    PRINT_FAILED: (printerName: string, jobName: string, reason?: string) => ({
        type: "ERROR" as NotificationType,
        title: "Print Failed",
        message: reason
            ? `Print job "${jobName}" failed on ${printerName}: ${reason}`
            : `Print job "${jobName}" failed on ${printerName}`
    }),
    PRINT_PAUSED: (printerName: string, jobName: string) => ({
        type: "WARNING" as NotificationType,
        title: "Print Paused",
        message: `Print job "${jobName}" was paused on ${printerName}`
    }),
    PRINT_RESUMED: (printerName: string, jobName: string) => ({
        type: "INFO" as NotificationType,
        title: "Print Resumed",
        message: `Print job "${jobName}" resumed on ${printerName}`
    }),
    PRINT_CANCELLED: (printerName: string, jobName: string) => ({
        type: "WARNING" as NotificationType,
        title: "Print Cancelled",
        message: `Print job "${jobName}" was cancelled on ${printerName}`
    }),

    // Slicer Events
    SLICE_FAILED: (modelName: string, reason: string) => ({
        type: "ERROR" as NotificationType,
        title: "Slicing Failed",
        message: `Failed to slice "${modelName}": ${reason}`
    }),

    // Printer Status Events
    PRINTER_ONLINE: (printerName: string) => ({
        type: "SUCCESS" as NotificationType,
        title: "Printer Online",
        message: `Printer "${printerName}" is now online`
    }),
    PRINTER_OFFLINE: (printerName: string) => ({
        type: "ERROR" as NotificationType,
        title: "Printer Offline",
        message: `Printer "${printerName}" went offline`
    }),
    PRINTER_DISCONNECTED: (printerName: string) => ({
        type: "ERROR" as NotificationType,
        title: "Printer Disconnected",
        message: `Printer "${printerName}" disconnected during print`
    }),
    PRINTER_ERROR: (printerName: string, error?: string) => ({
        type: "ERROR" as NotificationType,
        title: "Printer Error",
        message: error
            ? `Printer "${printerName}" reported an error: ${error}`
            : `Printer "${printerName}" reported an error`
    }),

    // Queue Events
    JOB_DISPATCHED: (printerName: string, jobName: string) => ({
        type: "INFO" as NotificationType,
        title: "Job Dispatched",
        message: `Job "${jobName}" dispatched to ${printerName}`
    }),
    WORK_STEALING: (printerName: string, jobName: string) => ({
        type: "INFO" as NotificationType,
        title: "Job Reassigned",
        message: `Job "${jobName}" reassigned to available printer ${printerName}`
    }),
}

/**
 * Create a persistent notification in the database
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
) {
    return db.notification.create({
        data: {
            userId,
            type,
            title,
            message,
        }
    })
}

/**
 * Create a notification from a predefined event
 */
export async function createNotificationFromEvent(
    userId: string,
    event: { type: NotificationType; title: string; message: string }
) {
    return createNotification(userId, event.type, event.title, event.message)
}

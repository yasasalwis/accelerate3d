"use server"

import { db } from "./db"
import { revalidatePath } from "next/cache"

// ============================================
// MANUFACTURER ACTIONS
// ============================================

export async function createManufacturer(data: {
    name: string
    country?: string
    website?: string
}) {
    const manufacturer = await db.manufacturer.create({
        data
    })
    revalidatePath("/admin")
    return manufacturer
}

export async function getManufacturers() {
    return db.manufacturer.findMany({
        orderBy: { name: "asc" }
    })
}

export async function deleteManufacturer(id: string) {
    await db.manufacturer.delete({ where: { id } })
    revalidatePath("/admin")
}

// ============================================
// TECHNOLOGY ACTIONS
// ============================================

export async function createTechnology(data: {
    name: string
    description?: string
}) {
    const technology = await db.printerTechnology.create({
        data
    })
    revalidatePath("/admin")
    return technology
}

export async function getTechnologies() {
    return db.printerTechnology.findMany({
        orderBy: { name: "asc" }
    })
}

export async function deleteTechnology(id: string) {
    await db.printerTechnology.delete({ where: { id } })
    revalidatePath("/admin")
}

// ============================================
// FEATURE ACTIONS
// ============================================

export async function createFeature(data: {
    name: string
    description?: string
}) {
    const feature = await db.printerFeature.create({
        data
    })
    revalidatePath("/admin")
    return feature
}

export async function getFeatures() {
    return db.printerFeature.findMany({
        orderBy: { name: "asc" }
    })
}

export async function deleteFeature(id: string) {
    await db.printerFeature.delete({ where: { id } })
    revalidatePath("/admin")
}

// ============================================
// MARKET PRINTER ACTIONS
// ============================================

export async function createMarketPrinter(data: {
    manufacturerId: string
    model: string
    technologyId: string
    buildVolumeX: number
    buildVolumeY: number
    buildVolumeZ: number
    maxPowerConsumptionW?: number
    priceUsd?: number
    imageUrl?: string
    sourceUrl?: string
    featureIds: string[]
}) {
    const { featureIds, ...printerData } = data

    const printer = await db.printer.create({
        data: {
            ...printerData,
            features: {
                create: featureIds.map(featureId => ({
                    featureId
                }))
            }
        },
        include: {
            manufacturer: true,
            technology: true,
            features: {
                include: {
                    feature: true
                }
            }
        }
    })

    revalidatePath("/admin")
    revalidatePath("/printers")
    return printer
}

export async function getMarketPrinters() {
    return db.printer.findMany({
        include: {
            manufacturer: true,
            technology: true,
            features: {
                include: {
                    feature: true
                }
            }
        },
        orderBy: [
            { manufacturer: { name: "asc" } },
            { model: "asc" }
        ]
    })
}

export async function deleteMarketPrinter(id: string) {
    await db.printer.delete({ where: { id } })
    revalidatePath("/admin")
    revalidatePath("/printers")
}

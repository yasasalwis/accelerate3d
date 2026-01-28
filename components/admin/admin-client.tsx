"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ManufacturerForm } from "./manufacturer-form"
import { TechnologyForm } from "./technology-form"
import { FeatureForm } from "./feature-form"
import { PrinterForm } from "./printer-form"

interface Manufacturer {
    id: string
    name: string
    country: string | null
    website: string | null
    createdAt: Date
}

interface PrinterTechnology {
    id: string
    name: string
    description: string | null
    createdAt: Date
}

interface PrinterFeature {
    id: string
    name: string
    description: string | null
    createdAt: Date
}

interface Printer {
    id: string
    model: string
    // make: string (Removed to match Prisma object)
    manufacturer: { name: string }
    manufacturerId: string
    technologyId: string
    technology: PrinterTechnology
    features: { feature: PrinterFeature }[]
    buildVolumeX: number
    buildVolumeY: number
    buildVolumeZ: number
    maxPowerConsumptionW: number | null
    priceUsd: number | null
    imageUrl: string | null
    sourceUrl: string | null
    createdAt: Date
    updatedAt: Date
}

interface AdminClientProps {
    manufacturers: Manufacturer[]
    technologies: PrinterTechnology[]
    features: PrinterFeature[]
    printers: Printer[]
}

const tabs = [
    { id: "manufacturers", label: "Manufacturers" },
    { id: "technologies", label: "Technologies" },
    { id: "features", label: "Features" },
    { id: "printers", label: "Market Printers" },
]

export default function AdminClient({ manufacturers, technologies, features, printers }: AdminClientProps) {
    const [activeTab, setActiveTab] = useState("manufacturers")
    const router = useRouter()

    const handleRefresh = () => {
        router.refresh()
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === tab.id
                            ? "text-neon-red border-b-2 border-neon-red"
                            : "text-muted-foreground hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "manufacturers" && (
                    <ManufacturerForm manufacturers={manufacturers} onRefresh={handleRefresh} />
                )}
                {activeTab === "technologies" && (
                    <TechnologyForm technologies={technologies} onRefresh={handleRefresh} />
                )}
                {activeTab === "features" && (
                    <FeatureForm features={features} onRefresh={handleRefresh} />
                )}
                {activeTab === "printers" && (
                    <PrinterForm
                        manufacturers={manufacturers}
                        technologies={technologies}
                        features={features}
                        printers={printers}
                        onRefresh={handleRefresh}
                    />
                )}
            </div>
        </div>
    )
}

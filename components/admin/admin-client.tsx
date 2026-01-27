"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ManufacturerForm } from "./manufacturer-form"
import { TechnologyForm } from "./technology-form"
import { FeatureForm } from "./feature-form"
import { PrinterForm } from "./printer-form"

interface AdminClientProps {
    manufacturers: any[]
    technologies: any[]
    features: any[]
    printers: any[]
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

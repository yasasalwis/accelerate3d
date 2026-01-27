import {getFeatures, getManufacturers, getMarketPrinters, getTechnologies} from "@/lib/admin-actions"
import AdminClient from "@/components/admin/admin-client"

export default async function AdminPage() {
    const [manufacturers, technologies, features, printers] = await Promise.all([
        getManufacturers(),
        getTechnologies(),
        getFeatures(),
        getMarketPrinters()
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                <p className="text-muted-foreground">Manage market printer definitions, manufacturers, technologies, and
                    features</p>
            </div>

            <AdminClient
                manufacturers={manufacturers}
                technologies={technologies}
                features={features}
                printers={printers}
            />
        </div>
    )
}

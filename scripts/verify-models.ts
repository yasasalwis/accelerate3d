
import { db } from "@/lib/db"

async function main() {
    try {
        const models = await db.model.findMany()
        console.log(`Found ${models.length} models.`)
        if (models.length > 0) {
            console.log("First model:", models[0].name)
        }
    } catch (error) {
        console.error("Error fetching models:", error)
    }
}

main()

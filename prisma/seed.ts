import { db } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read printer data from JSON file
const printersDataPath = join(__dirname, 'printers-data.json')
const printersJson = readFileSync(printersDataPath, 'utf-8')
const marketPrinters = JSON.parse(printersJson)

async function main() {
    console.log('Start seeding printer definitions...')
    console.log(`Found ${marketPrinters.length} printer definitions to seed...`)

    for (const printer of marketPrinters) {
        const result = await db.printer.upsert({
            where: {
                make_model: {
                    make: printer.make,
                    model: printer.model,
                },
            },
            update: printer,
            create: printer,
        })
        console.log(`Upserted printer definition: ${result.make} ${result.model}`)
    }

    console.log('Seeding finished: ${marketPrinters.length} printer definitions.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })

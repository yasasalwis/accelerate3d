import { db } from '@/lib/db'

const marketPrinters = [
    // Bambu Lab
    {
        make: 'Bambu Lab',
        model: 'X1 Carbon',
        buildVolumeX: 256,
        buildVolumeY: 256,
        buildVolumeZ: 256,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 1199,
        features: JSON.stringify(['CoreXY', 'Lidar', 'AI Failure Detection', 'AMS Compatible', 'Enclosed']),
    },
    {
        make: 'Bambu Lab',
        model: 'P1S',
        buildVolumeX: 256,
        buildVolumeY: 256,
        buildVolumeZ: 256,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 599,
        features: JSON.stringify(['CoreXY', 'Enclosed', 'AMS Compatible', 'High Speed']),
    },
    {
        make: 'Bambu Lab',
        model: 'P1P',
        buildVolumeX: 256,
        buildVolumeY: 256,
        buildVolumeZ: 256,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 499,
        features: JSON.stringify(['CoreXY', 'Open Frame', 'High Speed', 'AMS Compatible']),
    },
    {
        make: 'Bambu Lab',
        model: 'A1',
        buildVolumeX: 256,
        buildVolumeY: 256,
        buildVolumeZ: 256,
        technology: 'FDM',
        maxPowerConsumptionW: 150,
        priceUsd: 399,
        features: JSON.stringify(['Bed Slinger', 'AMS Lite Compatible', 'Active Flow Rate Compensation']),
    },
    {
        make: 'Bambu Lab',
        model: 'A1 Mini',
        buildVolumeX: 180,
        buildVolumeY: 180,
        buildVolumeZ: 180,
        technology: 'FDM',
        maxPowerConsumptionW: 150,
        priceUsd: 299,
        features: JSON.stringify(['Compact', 'Bed Slinger', 'AMS Lite Compatible']),
    },
    // Creality
    {
        make: 'Creality',
        model: 'Ender 3 V3 SE',
        buildVolumeX: 220,
        buildVolumeY: 220,
        buildVolumeZ: 250,
        technology: 'FDM',
        maxPowerConsumptionW: 350,
        priceUsd: 199,
        features: JSON.stringify(['Auto Leveling', 'Direct Drive', 'Budget Friendly', 'Bed Slinger']),
    },
    {
        make: 'Creality',
        model: 'Ender 3 V3 KE',
        buildVolumeX: 220,
        buildVolumeY: 220,
        buildVolumeZ: 240,
        technology: 'FDM',
        maxPowerConsumptionW: 350,
        priceUsd: 279,
        features: JSON.stringify(['High Speed', 'Klipper-based OS', 'Linear Rails']),
    },
    {
        make: 'Creality',
        model: 'K1C',
        buildVolumeX: 220,
        buildVolumeY: 220,
        buildVolumeZ: 250,
        technology: 'FDM',
        maxPowerConsumptionW: 350,
        priceUsd: 559,
        features: JSON.stringify(['CoreXY', 'Enclosed', 'Carbon Fiber Support', 'AI Camera']),
    },
    {
        make: 'Creality',
        model: 'K1 Max',
        buildVolumeX: 300,
        buildVolumeY: 300,
        buildVolumeZ: 300,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 899,
        features: JSON.stringify(['Large CoreXY', 'Lidar', 'AI Camera', 'Enclosed']),
    },
    // Prusa
    {
        make: 'Prusa Research',
        model: 'MK4S',
        buildVolumeX: 250,
        buildVolumeY: 210,
        buildVolumeZ: 220,
        technology: 'FDM',
        maxPowerConsumptionW: 280,
        priceUsd: 1099,
        features: JSON.stringify(['Reliable', 'Nextruder', 'Input Shaper', 'Bed Slinger']),
    },
    {
        make: 'Prusa Research',
        model: 'XL (5 Toolhead)',
        buildVolumeX: 360,
        buildVolumeY: 360,
        buildVolumeZ: 360,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 3999,
        features: JSON.stringify(['Toolchanger', 'CoreXY', 'Large Format', 'Multi-Material']),
    },
    {
        make: 'Prusa Research',
        model: 'XL (1 Toolhead)',
        buildVolumeX: 360,
        buildVolumeY: 360,
        buildVolumeZ: 360,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 1999,
        features: JSON.stringify(['Toolchanger Ready', 'CoreXY', 'Large Format']),
    },
    // Elegoo
    {
        make: 'Elegoo',
        model: 'Neptune 4 Pro',
        buildVolumeX: 225,
        buildVolumeY: 225,
        buildVolumeZ: 265,
        technology: 'FDM',
        maxPowerConsumptionW: 310,
        priceUsd: 285,
        features: JSON.stringify(['Klipper High Speed', 'Segmented Heatbed', 'Direct Drive']),
    },
    {
        make: 'Elegoo',
        model: 'Saturn 4 Ultra',
        buildVolumeX: 219,
        buildVolumeY: 123,
        buildVolumeZ: 220,
        technology: 'SLA',
        maxPowerConsumptionW: 144,
        priceUsd: 399,
        features: JSON.stringify(['Resin', 'Tilt Release', 'AI Monitoring', '12K']),
    },
    // Anycubic
    {
        make: 'Anycubic',
        model: 'Kobra 3 Combo',
        buildVolumeX: 220,
        buildVolumeY: 220,
        buildVolumeZ: 250,
        technology: 'FDM',
        maxPowerConsumptionW: 400,
        priceUsd: 449,
        features: JSON.stringify(['Multi-Color (ACE Pro)', 'High Speed', 'Bed Slinger']),
    },
    // Voron
    {
        make: 'Voron Design',
        model: 'Voron 2.4 350',
        buildVolumeX: 350,
        buildVolumeY: 350,
        buildVolumeZ: 350,
        technology: 'FDM',
        maxPowerConsumptionW: 1000,
        priceUsd: 1200,
        features: JSON.stringify(['DIY', 'CoreXY', 'Flying Gantry', 'High Performance']),
    },
]

async function main() {
    console.log('Start seeding printer definitions...')

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

    console.log('Seeding finished definitions.')
}

console.log('Fleet, Models, and Jobs seeded!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // No explicit disconnect needed with singleton usually, but good practice if supported?
        // With adapter/better-sqlite3, connection management is handled. 
        // We can just exit.
    })

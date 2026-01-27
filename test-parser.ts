import { parseGCode } from './lib/gcode-parser'
import { readFileSync } from 'fs'
import path from 'path'

// Test with the sample G-code file
const samplePath = path.join(process.cwd(), 'sample.gcode')
const content = readFileSync(samplePath, 'utf-8')

console.log('Testing G-code Parser')
console.log('===================\n')
console.log('Sample G-code content:')
console.log(content)
console.log('\n===================\n')

const metadata = parseGCode(content)

console.log('Extracted Metadata:')
console.log('-------------------')
console.log(`Material: ${metadata.material || 'Not detected'}`)
console.log(`Dimensions: ${metadata.widthMm}mm x ${metadata.depthMm}mm x ${metadata.heightMm}mm`)
console.log(`Estimated Time: ${metadata.estimatedTime} seconds (${Math.floor((metadata.estimatedTime || 0) / 60)} minutes)`)
console.log(`Filament: ${metadata.filamentGrams}g`)
console.log(`Layer Height: ${metadata.layerHeightMm || 'Not detected'}mm`)
console.log(`Nozzle Temp: ${metadata.nozzleTempC || 'Not detected'}°C`)
console.log(`Bed Temp: ${metadata.bedTempC || 'Not detected'}°C`)

// Standalone entry point: regenerate cost/latency charts from the existing
// report.md without re-running the benchmark.
//
//   bun run charts
//
// Reads config.reportPath and writes cost.png / latency.png into
// config.chartsDir, overwriting existing files.
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.js'
import { generateCharts } from './phases/generateCharts.js'

const reportPath = path.resolve(config.reportPath)
const chartsDir = path.resolve(config.chartsDir)

if (!fs.existsSync(reportPath)) {
  console.error(`Error: report does not exist: ${reportPath}`)
  process.exit(1)
}

console.log(`Generating charts from ${reportPath}...`)
const written = await generateCharts({ reportPath, chartsDir })
if (written.length === 0) {
  console.error('No chartable rows found in report (all failed or missing prices?).')
  process.exit(1)
}
console.log(`  ${written.length} chart(s) -> ${chartsDir}`)

import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.js'
import { writeReport } from './logger.js'
import { allModels } from './models.js'
import { generateCharts } from './phases/generateCharts.js'
import { runGenerateVideo } from './runners/generateVideo.js'
import type { RunResult } from './types.js'

if (!process.env['AI_GATEWAY_API_KEY']) {
  console.error('Error: AI_GATEWAY_API_KEY is not set.')
  process.exit(1)
}

const outputDir = path.resolve(config.outputDir)
const chartsDir = path.resolve(config.chartsDir)
const reportPath = path.resolve(config.reportPath)
const resultsDir = path.dirname(reportPath)

console.log(`Cleaning ${resultsDir}...`)
fs.rmSync(resultsDir, { recursive: true, force: true })

console.log(`\nPrompt: "${config.prompt.slice(0, 80)}..."`)
console.log(`Models: ${allModels.length}\n`)

const results: RunResult[] = []

for (const model of allModels) {
  process.stdout.write(`  ${model.name} (${model.id}) ... `)

  const result = await runGenerateVideo(model, config.prompt, {
    outputDir,
    saveVideos: true,
    defaults: {
      aspectRatio: config.aspectRatio,
      resolution: config.resolution,
      duration: config.duration,
    },
  })

  if (result.success) {
    const cost = result.cost != null ? ` $${result.cost}` : ''
    console.log(`OK ${(result.wallLatencyMs / 1000).toFixed(2)}s*, ${result.videoCount} video(s)${cost}`)
  } else {
    console.log(`FAILED: ${result.error}`)
  }

  results.push(result)

  // Short delay between requests to avoid rate limiting.
  if (model !== allModels[allModels.length - 1]) {
    await new Promise((resolve) => setTimeout(resolve, config.delayBetweenRequestsMs))
  }
}

const absReportPath = await writeReport(config.prompt, results, reportPath)
console.log(`\nReport: ${absReportPath}`)

console.log('\nGenerating charts...')
const charts = await generateCharts({ reportPath, chartsDir })
console.log(`  ${charts.length} chart(s) -> ${chartsDir}`)

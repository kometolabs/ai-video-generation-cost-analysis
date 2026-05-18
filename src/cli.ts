import fs from 'node:fs'
import path from 'node:path'
import {
  effectiveInputs,
  inputsMatch,
  loadCache,
  saveCache,
  seedFromReport,
  toRunEntry,
} from './cache.js'
import { config } from './config.js'
import { writeReport } from './logger.js'
import { allModels, declaredModels } from './models.js'
import { generateCharts } from './phases/generateCharts.js'
import { runGenerateVideo } from './runners/generateVideo.js'
import type { ModelConfig, RunInputs } from './types.js'

if (!process.env['AI_GATEWAY_API_KEY']) {
  console.error('Error: AI_GATEWAY_API_KEY is not set.')
  process.exit(1)
}

// Minimal arg parser - the surface is small enough that pulling in a lib
// isn't worth it.
//
//   bun start                                      # default: skip cached models
//   bun start --force                              # re-run every enabled model
//   bun start --only alibaba/wan-v2.6-t2v,xai/...  # re-run only the listed ids
function parseArgs(argv: string[]): { forceAll: boolean; only: Set<string> | null } {
  const forceAll = argv.includes('--force') || argv.includes('--regenerate-all')

  let onlyRaw: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a?.startsWith('--only=')) onlyRaw = a.slice('--only='.length)
    else if (a === '--only') onlyRaw = argv[i + 1]
  }
  const only = onlyRaw
    ? new Set(
        onlyRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      )
    : null

  return { forceAll, only }
}

const { forceAll, only } = parseArgs(process.argv.slice(2))

const outputDir = path.resolve(config.outputDir)
const chartsDir = path.resolve(config.chartsDir)
const reportPath = path.resolve(config.reportPath)
const cachePath = path.resolve(config.cachePath)

const defaults = {
  prompt: config.prompt,
  duration: config.duration,
  resolution: config.resolution,
  aspectRatio: config.aspectRatio,
}

const inputsFor = (model: ModelConfig): RunInputs => effectiveInputs(model, defaults)

// Bootstrap the cache. If cache.json is missing but a report.md exists, seed
// from the report so users don't have to pay to regenerate everything just to
// start using the cache.
let cache = loadCache(cachePath)
if (Object.keys(cache.entries).length === 0 && fs.existsSync(reportPath)) {
  console.log('Seeding cache from existing report.md...')
  cache = seedFromReport({
    models: declaredModels,
    reportPath,
    videosDir: outputDir,
    inputsFor,
  })
  saveCache(cachePath, cache)
  console.log(`  ${Object.keys(cache.entries).length} entry/entries seeded.`)
}

function shouldRun(model: ModelConfig, current: RunInputs): boolean {
  // --only takes precedence: explicit subset always runs, others skip entirely.
  if (only) return only.has(model.id)
  if (forceAll) return true
  const entry = cache.entries[model.id]
  if (!entry || !entry.success) return true
  if (!inputsMatch(entry.inputs, current)) return true
  // Cache hit, but the file was deleted from disk - regenerate.
  if (entry.videoPath && !fs.existsSync(entry.videoPath)) return true
  return false
}

console.log(`\nPrompt: "${config.prompt.slice(0, 80)}..."`)
console.log(`Models: ${allModels.length}`)
if (forceAll) console.log('Mode: --force (regenerating all)')
else if (only) console.log(`Mode: --only ${[...only].join(',')}`)
else console.log('Mode: cached (skipping models with valid cache entries)')
console.log('')

const toRun = allModels.filter((m) => shouldRun(m, inputsFor(m)))

// First pass: report what we'll skip, so progress output reflects every
// enabled model and the user can see what's being reused.
for (const model of allModels) {
  if (toRun.includes(model)) continue
  const entry = cache.entries[model.id]
  if (entry) {
    const cost = entry.cost != null ? ` $${entry.cost}` : ''
    console.log(`  ${model.name} (${model.id}) ... CACHED (${entry.generatedAt.slice(0, 10)}${cost})`)
  } else {
    // --only path: a non-listed model with no cache entry just gets a note.
    console.log(`  ${model.name} (${model.id}) ... SKIPPED (no cache, not in --only)`)
  }
}

for (let i = 0; i < toRun.length; i++) {
  const model = toRun[i]!
  const current = inputsFor(model)

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

  cache.entries[model.id] = toRunEntry({
    model,
    inputs: current,
    success: result.success,
    error: result.error,
    wallLatencyMs: result.wallLatencyMs,
    videoPath: result.savedVideos[0],
    mediaType: result.mediaType,
    cost: result.cost,
  })

  // Persist after every model so an interrupted run still captures completed
  // work - video generation is slow and expensive enough to be worth it.
  saveCache(cachePath, cache)

  if (i < toRun.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, config.delayBetweenRequestsMs))
  }
}

// Report includes every declared model that has a cache entry, plus any
// enabled model (even if uncached - shown as "-"). This way disabling a model
// in models.ts skips its generation but keeps it visible in the comparison.
const reportModels = declaredModels.filter((m) => m.enabled || cache.entries[m.id])

const absReportPath = await writeReport(config.prompt, reportModels, cache, reportPath)
console.log(`\nReport: ${absReportPath}`)

console.log('\nGenerating charts...')
const charts = await generateCharts({ reportPath, chartsDir })
console.log(`  ${charts.length} chart(s) -> ${chartsDir}`)

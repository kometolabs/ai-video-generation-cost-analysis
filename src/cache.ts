import fs from 'node:fs'
import path from 'node:path'
import type { ModelConfig, RunCache, RunEntry, RunInputs } from './types.js'

const CACHE_VERSION = 1

// videoPath is stored relative to the cache file's directory so the JSON is
// portable across machines (results/ is committed to git). In-memory it's
// kept absolute so call sites don't need to know about the convention.
function toAbsolutePaths(cache: RunCache, baseDir: string): RunCache {
  for (const entry of Object.values(cache.entries)) {
    if (entry.videoPath && !path.isAbsolute(entry.videoPath)) {
      entry.videoPath = path.resolve(baseDir, entry.videoPath)
    }
  }
  return cache
}

function withRelativePaths(cache: RunCache, baseDir: string): RunCache {
  return {
    version: cache.version,
    entries: Object.fromEntries(
      Object.entries(cache.entries).map(([id, entry]) => [
        id,
        {
          ...entry,
          videoPath:
            entry.videoPath && path.isAbsolute(entry.videoPath)
              ? path.relative(baseDir, entry.videoPath)
              : entry.videoPath,
        },
      ]),
    ),
  }
}

export function loadCache(cachePath: string): RunCache {
  if (!fs.existsSync(cachePath)) return { version: CACHE_VERSION, entries: {} }
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as RunCache
    if (!parsed?.entries) return { version: CACHE_VERSION, entries: {} }
    return toAbsolutePaths(parsed, path.dirname(cachePath))
  } catch {
    return { version: CACHE_VERSION, entries: {} }
  }
}

export function saveCache(cachePath: string, cache: RunCache): void {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true })
  const portable = withRelativePaths(cache, path.dirname(cachePath))
  fs.writeFileSync(cachePath, `${JSON.stringify(portable, null, 2)}\n`)
}

export function inputsMatch(a: RunInputs, b: RunInputs): boolean {
  return (
    a.prompt === b.prompt &&
    a.duration === b.duration &&
    a.resolution === b.resolution &&
    a.aspectRatio === b.aspectRatio
  )
}

// Resolves the effective inputs a model would receive on the next run, taking
// per-model overrides and skip flags into account. Used as the cache key.
export function effectiveInputs(
  model: ModelConfig,
  defaults: { prompt: string; duration: number; resolution: string; aspectRatio: string },
): RunInputs {
  return {
    prompt: defaults.prompt,
    duration: model.duration ?? defaults.duration,
    resolution: model.skipResolution ? undefined : (model.resolution ?? defaults.resolution),
    aspectRatio: model.skipAspectRatio ? undefined : (model.aspectRatio ?? defaults.aspectRatio),
  }
}

// One-time migration: when cache.json doesn't exist but a report.md does,
// reconstruct cache entries from the report's table + the videos directory.
// Without this, switching to the cache would force the user to pay for a full
// regeneration just to seed it.
//
// Handles both the old report format (header `**Run:** <iso>`, no per-row
// date) and the new format (header `**Last updated:**`, per-row `Generated`
// column). Per-row dates win when present.
export function seedFromReport(opts: {
  models: ModelConfig[]
  reportPath: string
  videosDir: string
  inputsFor: (model: ModelConfig) => RunInputs
}): RunCache {
  const cache: RunCache = { version: CACHE_VERSION, entries: {} }
  if (!fs.existsSync(opts.reportPath)) return cache

  const md = fs.readFileSync(opts.reportPath, 'utf-8')
  const headerMatch = md.match(/\*\*(?:Run|Last updated):\*\*\s*(\S+)/)
  const headerDate = headerMatch?.[1] ?? new Date().toISOString()

  // Captures: model id, cost, latency, optional per-row YYYY-MM-DD date.
  const rowRegex =
    /^\|\s*`([^`]+)`\s*\|\s*\$?([\d.]+)\s*\|\s*([\d.]+)s\s*\|(?:\s*(\d{4}-\d{2}-\d{2})\s*\|)?/gm
  for (const match of md.matchAll(rowRegex)) {
    const [, id, costStr, latencyStr, rowDate] = match
    const model = opts.models.find((m) => m.id === id)
    if (!model || !id || !costStr || !latencyStr) continue

    const slug = model.id.replace('/', '-')
    const videoPath = path.join(opts.videosDir, `${slug}.mp4`)
    const exists = fs.existsSync(videoPath)

    cache.entries[model.id] = {
      modelId: model.id,
      modelName: model.name,
      provider: model.provider,
      success: true,
      wallLatencyMs: Math.round(parseFloat(latencyStr) * 1000),
      videoPath: exists ? videoPath : undefined,
      mediaType: 'video/mp4',
      cost: costStr,
      generatedAt: rowDate ? `${rowDate}T00:00:00.000Z` : headerDate,
      inputs: opts.inputsFor(model),
    }
  }
  return cache
}

export function toRunEntry(opts: {
  model: ModelConfig
  inputs: RunInputs
  success: boolean
  error?: string
  wallLatencyMs: number
  videoPath?: string
  mediaType?: string
  cost?: string
}): RunEntry {
  return {
    modelId: opts.model.id,
    modelName: opts.model.name,
    provider: opts.model.provider,
    success: opts.success,
    error: opts.error,
    wallLatencyMs: opts.wallLatencyMs,
    videoPath: opts.videoPath,
    mediaType: opts.mediaType,
    cost: opts.cost,
    generatedAt: new Date().toISOString(),
    inputs: opts.inputs,
  }
}

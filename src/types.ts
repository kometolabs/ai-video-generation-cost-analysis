import type { JSONValue } from 'ai'

export interface ModelConfig {
  // Unique benchmark id - also used as the cache key, filename slug, and label.
  // For most models this matches the gateway id verbatim. For mode variants
  // (e.g. Kling Pro alongside Std) give each variant a distinct id and set
  // `gatewayId` to the shared underlying model.
  id: string
  // Vercel AI Gateway model id (e.g. 'klingai/kling-v3.0-t2v'). Defaults to
  // `id` when omitted.
  gatewayId?: string
  name: string // Human-readable name
  provider: string // Provider display name
  notes?: string
  // Set to false to skip this model during runs.
  enabled: boolean
  // Per-model override of the global aspectRatio (e.g. '16:9').
  aspectRatio?: string
  // Per-model override of the global resolution (e.g. '1280x720', '720p').
  resolution?: string
  // Per-model override of the global duration in seconds.
  duration?: number
  // Set true for providers that reject the `resolution` parameter (e.g. KlingAI).
  // The runner omits `resolution` entirely when this is set.
  skipResolution?: boolean
  // Set true for providers that reject the `aspectRatio` parameter (e.g. Alibaba Wan).
  // The runner omits `aspectRatio` entirely when this is set.
  skipAspectRatio?: boolean
  // Provider-specific options passed directly to generateVideo's providerOptions.
  providerOptions?: Record<string, Record<string, JSONValue>>
}

export interface RunResult {
  model: ModelConfig
  success: boolean
  error?: string
  wallLatencyMs: number // Client-side wall clock time
  videoCount: number
  savedVideos: string[] // Paths to saved videos (empty if --no-save)
  mediaType?: string // e.g. 'video/mp4'
  cost?: string // Total cost in USD
}

// Inputs that determine whether a cached result is still valid for a model.
// When any of these change between runs, the cache entry is treated as stale
// and the model is re-generated.
export interface RunInputs {
  prompt: string
  duration: number
  resolution?: string
  aspectRatio?: string
}

// One cached entry per model in results/cache.json. Holds enough to render the
// report and decide whether to re-run.
export interface RunEntry {
  modelId: string
  modelName: string
  provider: string
  success: boolean
  error?: string
  wallLatencyMs: number
  videoPath?: string
  mediaType?: string
  cost?: string
  generatedAt: string // ISO timestamp
  inputs: RunInputs
}

export interface RunCache {
  version: 1
  entries: Record<string, RunEntry>
}

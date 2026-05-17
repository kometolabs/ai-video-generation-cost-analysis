import type { JSONValue } from 'ai'

export interface ModelConfig {
  id: string // Vercel AI Gateway model ID (e.g. 'klingai/kling-v2.6-t2v')
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

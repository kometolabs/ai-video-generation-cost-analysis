import type { ModelConfig } from './types.js'

// Text-to-video models behind the Vercel AI Gateway.
// See MODEL-QUIRKS.md for per-provider parameter constraints.
const models: ModelConfig[] = [
  {
    id: 'xai/grok-imagine-video',
    name: 'Grok Imagine Video',
    provider: 'xAI',
    notes: '720p ceiling, duration 1-15s',
    enabled: true,
    providerOptions: { xai: { pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v2.6-t2v',
    name: 'Kling 2.6 T2V',
    provider: 'KlingAI',
    notes: 'Standard mode; rejects `resolution`, uses `aspectRatio` only',
    enabled: true,
    // Kling v2.x duration must be 5 or 10.
    duration: 5,
    // Kling does not accept the `resolution` parameter.
    skipResolution: true,
    providerOptions: { klingai: { mode: 'std', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'google/veo-3.1-generate-001',
    name: 'Veo 3.1',
    provider: 'Google',
    notes: 'Requires generateAudio; duration in {4,6,8}; resolution as 720p/1080p',
    enabled: true,
    // Veo accepts only 4/6/8 seconds.
    duration: 4,
    // Veo expects '720p'/'1080p', not WxH.
    resolution: '720p',
    // Veo 3.x requires explicit generateAudio.
    providerOptions: { vertex: { generateAudio: true, pollTimeoutMs: 900_000 } },
  },
]

export const allModels: ModelConfig[] = models.filter((m) => m.enabled)

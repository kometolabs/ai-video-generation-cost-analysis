import type { ModelConfig } from './types.js'

// Text-to-video models behind the Vercel AI Gateway.
// One latest t2v model per provider, sourced from
// https://ai-gateway.vercel.sh/v1/models?capabilities=video-generation.
// See MODEL-QUIRKS.md for per-provider parameter constraints.
const models: ModelConfig[] = [
  {
    id: 'alibaba/wan-v2.6-t2v',
    name: 'Wan v2.6 T2V',
    provider: 'Alibaba',
    notes: '720p/1080p; rejects `aspectRatio`, uses `resolution` only',
    enabled: true,
    // Alibaba Wan rejects `aspectRatio`; size is set via `resolution`.
    skipAspectRatio: true,
    providerOptions: { alibaba: { pollTimeoutMs: 900_000 } },
  },
  {
    id: 'bytedance/seedance-2.0',
    name: 'Seedance 2.0',
    provider: 'ByteDance',
    notes: 'Token-based pricing; multi-modal input',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
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
  {
    id: 'klingai/kling-v3.0-t2v',
    name: 'Kling v3.0 T2V',
    provider: 'KlingAI',
    notes: 'Standard mode; rejects `resolution`, uses `aspectRatio` only',
    enabled: true,
    // Kling v2.x/v3.x duration must be 5 or 10.
    duration: 5,
    // Kling does not accept the `resolution` parameter.
    skipResolution: true,
    providerOptions: { klingai: { mode: 'std', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'xai/grok-imagine-video',
    name: 'Grok Imagine Video',
    provider: 'xAI',
    notes: '720p ceiling, duration 1-15s',
    enabled: true,
    providerOptions: { xai: { pollTimeoutMs: 900_000 } },
  },
]

export const allModels: ModelConfig[] = models.filter((m) => m.enabled)

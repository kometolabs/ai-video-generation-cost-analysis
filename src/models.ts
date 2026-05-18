import type { ModelConfig } from './types.js'

// Text-to-video models behind the Vercel AI Gateway.
// Sourced from https://ai-gateway.vercel.sh/v1/models?capabilities=video-generation
// (filter for `type: "video"` and t2v variants).
//
// Mode variants (Kling std vs pro, etc.) use a distinct `id` plus a shared
// `gatewayId` so each variant gets its own cache entry, video file, and row.
//
// See MODEL-QUIRKS.md for per-provider parameter constraints.
const models: ModelConfig[] = [
  // ---------- Alibaba Wan ----------
  {
    id: 'alibaba/wan-v2.5-t2v-preview',
    name: 'Wan v2.5 T2V (preview)',
    provider: 'Alibaba',
    notes: '480p/720p/1080p; rejects `aspectRatio`, uses `resolution` only',
    enabled: true,
    skipAspectRatio: true,
    providerOptions: { alibaba: { pollTimeoutMs: 900_000 } },
  },
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

  // ---------- ByteDance Seedance ----------
  {
    id: 'bytedance/seedance-v1.0-lite-t2v',
    name: 'Seedance v1.0 Lite T2V',
    provider: 'ByteDance',
    notes: '480p/720p/1080p, 3-12s; per-second pricing',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
  },
  {
    id: 'bytedance/seedance-v1.0-pro',
    name: 'Seedance v1.0 Pro',
    provider: 'ByteDance',
    notes: '1080p HD with multi-shot storytelling; per-second pricing',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
  },
  {
    id: 'bytedance/seedance-v1.0-pro-fast',
    name: 'Seedance v1.0 Pro Fast',
    provider: 'ByteDance',
    notes: 'Faster, cheaper variant of v1.0 Pro',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
  },
  {
    id: 'bytedance/seedance-v1.5-pro',
    name: 'Seedance v1.5 Pro',
    provider: 'ByteDance',
    notes: 'Native audio-video joint generation; per-second pricing',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
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
    id: 'bytedance/seedance-2.0-fast',
    name: 'Seedance 2.0 Fast',
    provider: 'ByteDance',
    notes: 'Faster, cheaper variant of 2.0; token-based pricing',
    enabled: true,
    providerOptions: { bytedance: { pollTimeoutMs: 900_000 } },
  },

  // ---------- Google Veo ----------
  {
    id: 'google/veo-3.0-generate-001',
    name: 'Veo 3.0',
    provider: 'Google',
    notes: 'Requires generateAudio; duration in {4,6,8}; resolution as 720p/1080p',
    enabled: true,
    duration: 4,
    resolution: '720p',
    providerOptions: { vertex: { generateAudio: true, pollTimeoutMs: 900_000 } },
  },
  {
    id: 'google/veo-3.0-fast-generate-001',
    name: 'Veo 3.0 Fast',
    provider: 'Google',
    notes: 'Faster, cheaper variant of Veo 3.0; same duration constraints',
    enabled: true,
    duration: 4,
    resolution: '720p',
    providerOptions: { vertex: { generateAudio: true, pollTimeoutMs: 900_000 } },
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
    id: 'google/veo-3.1-fast-generate-001',
    name: 'Veo 3.1 Fast',
    provider: 'Google',
    notes: 'Faster, cheaper variant of Veo 3.1; same duration constraints',
    enabled: true,
    duration: 4,
    resolution: '720p',
    providerOptions: { vertex: { generateAudio: true, pollTimeoutMs: 900_000 } },
  },

  // ---------- KlingAI ----------
  // Kling exposes std/pro modes; each is added as a separate entry so they
  // get distinct cache rows and benchmark side-by-side.
  {
    id: 'klingai/kling-v2.5-turbo-t2v',
    name: 'Kling v2.5 Turbo T2V (std)',
    provider: 'KlingAI',
    notes: 'Standard mode; v2.x requires duration in {5,10}; rejects `resolution`; audio not supported',
    enabled: true,
    duration: 5,
    skipResolution: true,
    // v2.5 doesn't support `sound`. The gateway rejects sound:'on' for this model.
    providerOptions: { klingai: { mode: 'std', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v2.5-turbo-t2v-pro',
    gatewayId: 'klingai/kling-v2.5-turbo-t2v',
    name: 'Kling v2.5 Turbo T2V (pro)',
    provider: 'KlingAI',
    notes: 'Pro mode; v2.x requires duration in {5,10}; rejects `resolution`; audio not supported',
    enabled: true,
    duration: 5,
    skipResolution: true,
    providerOptions: { klingai: { mode: 'pro', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v2.6-t2v',
    name: 'Kling v2.6 T2V (std)',
    provider: 'KlingAI',
    notes: 'Standard mode; v2.x requires duration in {5,10}; rejects `resolution`; std rejects sound:on (pro only)',
    enabled: true,
    duration: 5,
    skipResolution: true,
    // v2.6 std rejects sound:'on'; audio is pro-only on v2.6.
    providerOptions: { klingai: { mode: 'std', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v2.6-t2v-pro',
    gatewayId: 'klingai/kling-v2.6-t2v',
    name: 'Kling v2.6 T2V (pro)',
    provider: 'KlingAI',
    notes: 'Pro mode; v2.x requires duration in {5,10}; rejects `resolution`',
    enabled: true,
    duration: 5,
    skipResolution: true,
    providerOptions: { klingai: { mode: 'pro', sound: 'on', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v3.0-t2v',
    name: 'Kling v3.0 T2V (std)',
    provider: 'KlingAI',
    notes: 'Standard mode; rejects `resolution`, uses `aspectRatio` only',
    enabled: true,
    // Kling duration: v2.x must be 5 or 10; v3.0 allows 3-15. 5s works for both.
    duration: 5,
    // Kling does not accept the `resolution` parameter.
    skipResolution: true,
    // `sound: 'on'` enables audio (defaults to 'off'); adds ~50% to per-second cost.
    providerOptions: { klingai: { mode: 'std', sound: 'on', pollTimeoutMs: 900_000 } },
  },
  {
    id: 'klingai/kling-v3.0-t2v-pro',
    gatewayId: 'klingai/kling-v3.0-t2v',
    name: 'Kling v3.0 T2V (pro)',
    provider: 'KlingAI',
    notes: 'Pro mode; ~33% more expensive than std',
    enabled: true,
    duration: 5,
    skipResolution: true,
    providerOptions: { klingai: { mode: 'pro', sound: 'on', pollTimeoutMs: 900_000 } },
  },

  // ---------- xAI ----------
  {
    id: 'xai/grok-imagine-video',
    name: 'Grok Imagine Video',
    provider: 'xAI',
    notes: '720p ceiling, duration 1-15s',
    enabled: true,
    providerOptions: { xai: { pollTimeoutMs: 900_000 } },
  },
]

// Every declared model (enabled or not). Used when seeding the runs DB from
// an existing report, so historical entries are matched even if their model
// is currently disabled.
export const declaredModels: ModelConfig[] = models

export const allModels: ModelConfig[] = models.filter((m) => m.enabled)

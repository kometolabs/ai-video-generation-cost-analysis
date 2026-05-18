# Model Quirks and Adaptations

Documented workarounds for non-standard behavior across video generation providers.

> **Long-running calls:** Video jobs can hold the connection open for several minutes. Node's default Undici `headersTimeout`/`bodyTimeout` (5 min) closes them early. We use a custom `gateway` in [`src/gateway.ts`](./src/gateway.ts) with a 15-minute Undici `Agent` to keep long fetches alive.

---

## Google Veo 3.x

Applies to `google/veo-3.0-generate-001`, `google/veo-3.0-fast-generate-001`, `google/veo-3.1-generate-001`, and `google/veo-3.1-fast-generate-001`.

**Quirk:** `duration` must be one of `{4, 6, 8}`. Passing the global default `5` returns HTTP 400.

**Adaptation:** Per-model override `duration: 4` in `src/models.ts`.

---

**Quirk:** `resolution` expects the strings `'720p'` or `'1080p'` (Veo 3.1 also supports `'4k'`). The `WxH` format used by most other models is rejected.

**Adaptation:** Per-model override `resolution: '720p'` in `src/models.ts`.

---

**Quirk:** Veo 3.x requires `providerOptions.vertex.generateAudio` to be set explicitly.

**Adaptation:** `providerOptions: { vertex: { generateAudio: true } }` in `src/models.ts`.

---

## KlingAI

Applies to all Kling variants: `klingai/kling-v2.5-turbo-t2v`, `klingai/kling-v2.6-t2v`, `klingai/kling-v3.0-t2v`.

**Quirk:** Does not accept the `resolution` parameter. Uses `aspectRatio` only.

**Symptom:** Passing `resolution` errors out.

**Adaptation:** Per-model flag `skipResolution: true` in `src/models.ts` - the runner omits the field entirely for this model.

**Code:** `src/runners/generateVideo.ts` - `if (!model.skipResolution)` branch.

---

**Quirk:** `duration` rules differ by version. v2.x (v2.5 Turbo, v2.6) must be `5` or `10`. v3.0 allows `3-15`.

**Adaptation:** Explicit `duration: 5` on every Kling entry - matches both ranges and stays consistent across the family.

---

**Quirk:** `mode` defaults to `'std'`. Setting `'pro'` is significantly more expensive but higher quality. The price ratio varies by version (v3.0: std $0.168/s vs pro $0.224/s, ~33% premium; v2.x: roughly 1.7x).

**Adaptation:** `providerOptions: { klingai: { mode: 'std' } }` kept explicit so cost is predictable. Pro is added as a separate benchmark entry per the [mode variants](#mode-variants) pattern.

---

**Quirk:** Vercel AI Gateway enforces a 1 request/minute quota for KlingAI on accounts with balances below $100. The built-in 3-attempt retry burns all attempts inside the same minute and surfaces:
`Failed after 3 attempts. Last error: Video generation has a quota of 1 request per minute for balances below $100.`

**Adaptation:** None in code - either top up Gateway credits past $100 or space runs > 60s apart manually (the CLI already inserts a 65s delay between requests via `delayBetweenRequestsMs`).

---

**Quirk:** Audio is opt-in via `providerOptions.klingai.sound` (a string, `'on'` or `'off'`, not a boolean). Defaults to `'off'`, so output is silent unless explicitly enabled. Requires v2.6+ and adds ~50% to the per-second cost (v3.0 std: $0.168/s → $0.252/s). The internal gateway pricing JSON uses `audio: true/false`, but the SDK field is `sound`.

**Adaptation:** `providerOptions: { klingai: { sound: 'on' } }` on each Kling entry.

---

## Alibaba Wan

Applies to `alibaba/wan-v2.5-t2v-preview` and `alibaba/wan-v2.6-t2v`.

**Quirk:** Rejects the `aspectRatio` parameter. Size is set via `resolution` or `providerOptions.alibaba`. Passing `aspectRatio` triggers an AI SDK warning and the field is dropped.

**Symptom:** `AI SDK Warning (gateway / alibaba/wan-v2.6-t2v): The feature "aspectRatio" is not supported.`

**Adaptation:** Per-model flag `skipAspectRatio: true` in `src/models.ts` - the runner omits the field entirely.

**Code:** `src/runners/generateVideo.ts` - `if (!model.skipAspectRatio)` branch.

---

## ByteDance Seedance

Applies to `bytedance/seedance-v1.0-lite-t2v`, `seedance-v1.0-pro`, `seedance-v1.0-pro-fast`, `seedance-v1.5-pro`, `seedance-2.0`, and `seedance-2.0-fast`.

**Quirk:** Pricing model differs across versions. v1.x and v1.5 are billed per-second by resolution (480p/720p/1080p). v2.x is token-based, with the token count derived from output duration and (for `seedance-2.0`) whether the input includes video. The gateway returns the final cost regardless, so the benchmark records both consistently in `results/cache.json`.

**Adaptation:** None in code - the cost is taken verbatim from `result.providerMetadata?.gateway?.cost`.

---

**Quirk:** v1.x supports `480p`/`720p`/`1080p` with duration `3-12s`. The global defaults (`1280x720`, `5s`) work, but lower-cost runs are possible by overriding `resolution` per entry.

**Adaptation:** None applied by default - leave room for the user to add cost-optimized variants per the [mode variants](#mode-variants) pattern.

---

## xAI Grok Imagine Video

**Quirk:** 720p ceiling. Requesting higher resolutions silently downscales or errors depending on the path.

**Adaptation:** None - the global default of `1280x720` already fits.

---

**Quirk:** `duration` accepted range is 1-15 seconds.

**Adaptation:** None - the global default of `5` is within range.

---

**Quirk:** Returns ephemeral hosted URLs. The Vercel AI SDK materializes `uint8Array`/`base64` from those URLs during the call, so the saved file on disk does not depend on the URL remaining live. If `uint8Array` ever comes back empty, the runner would need a fallback fetch on `video.url`.

---

## Mode variants

Some providers expose multiple modes for the same underlying model - notably Kling's `std` vs `pro`. To benchmark them side-by-side (distinct cache entry, video file, and report row) while still routing to the same gateway model, give each variant a unique `id` and set `gatewayId` to the shared underlying model id.

**Pattern:**

```ts
{
  id: 'klingai/kling-v3.0-t2v',           // unique benchmark id (cache key, slug, label)
  name: 'Kling v3.0 T2V (std)',
  ...
  providerOptions: { klingai: { mode: 'std', ... } },
},
{
  id: 'klingai/kling-v3.0-t2v-pro',       // distinct id
  gatewayId: 'klingai/kling-v3.0-t2v',    // shared upstream model
  name: 'Kling v3.0 T2V (pro)',
  ...
  providerOptions: { klingai: { mode: 'pro', ... } },
},
```

**Code:** `src/runners/generateVideo.ts` uses `model.gatewayId ?? model.id` when calling `gateway.video(...)`. The cache (`results/cache.json`), filename slug, and report row all key off `model.id`, so the two variants stay independent.

# Model Quirks and Adaptations

Documented workarounds for non-standard behavior across video generation providers.

> **Long-running calls:** Video jobs can hold the connection open for several minutes. Node's default Undici `headersTimeout`/`bodyTimeout` (5 min) closes them early. We use a custom `gateway` in [`src/gateway.ts`](./src/gateway.ts) with a 15-minute Undici `Agent` to keep long fetches alive.

---

## Google Veo 3.1

**Quirk:** `duration` must be one of `{4, 6, 8}`. Passing the global default `5` returns HTTP 400.

**Adaptation:** Per-model override `duration: 4` in `src/models.ts`.

---

**Quirk:** `resolution` expects the strings `'720p'` or `'1080p'`. The `WxH` format used by most other models is rejected.

**Adaptation:** Per-model override `resolution: '720p'` in `src/models.ts`.

---

**Quirk:** Veo 3.x requires `providerOptions.vertex.generateAudio` to be set explicitly.

**Adaptation:** `providerOptions: { vertex: { generateAudio: true } }` in `src/models.ts`.

---

## KlingAI v2.6 t2v

**Quirk:** Does not accept the `resolution` parameter. Uses `aspectRatio` only.

**Symptom:** Passing `resolution` errors out.

**Adaptation:** Per-model flag `skipResolution: true` in `src/models.ts` - the runner omits the field entirely for this model.

**Code:** `src/runners/generateVideo.ts` - `if (!model.skipResolution)` branch.

---

**Quirk:** v2.x `duration` must be `5` or `10`.

**Adaptation:** Explicit `duration: 5` in the model entry (matches global default, kept explicit as a guard against future global changes).

---

**Quirk:** `mode` defaults to `'std'`. Setting `'pro'` is significantly more expensive but higher quality.

**Adaptation:** `providerOptions: { klingai: { mode: 'std' } }` kept explicit so cost is predictable.

---

**Quirk:** Vercel AI Gateway enforces a 1 request/minute quota for KlingAI on accounts with balances below $100. The built-in 3-attempt retry burns all attempts inside the same minute and surfaces:
`Failed after 3 attempts. Last error: Video generation has a quota of 1 request per minute for balances below $100.`

**Adaptation:** None in code - either top up Gateway credits past $100 or space runs > 60s apart manually.

---

## xAI Grok Imagine Video

**Quirk:** 720p ceiling. Requesting higher resolutions silently downscales or errors depending on the path.

**Adaptation:** None - the global default of `1280x720` already fits.

---

**Quirk:** `duration` accepted range is 1-15 seconds.

**Adaptation:** None - the global default of `5` is within range.

---

**Quirk:** Returns ephemeral hosted URLs. The Vercel AI SDK materializes `uint8Array`/`base64` from those URLs during the call, so the saved file on disk does not depend on the URL remaining live. If `uint8Array` ever comes back empty, the runner would need a fallback fetch on `video.url`.

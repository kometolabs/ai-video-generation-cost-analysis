# AI Video Generation Cost Analysis

Benchmark text-to-video models behind Vercel AI Gateway, save the generated videos, and produce a Markdown report with cost and latency per model.

## Results

Latest run - see the full table with per-model videos in [results/report.md](./results/report.md).

[![Cost per video](./results/videos/charts/cost.png)](./results/videos/charts/cost.png)

[![Latency](./results/videos/charts/latency.png)](./results/videos/charts/latency.png)

## What It Does

- Runs multiple text-to-video models through a single CLI.
- Uses `experimental_generateVideo` from the Vercel AI SDK (v6).
- Saves generated `.mp4` files to `./results/videos`.
- Renders cost and latency bar charts to `./results/videos/charts`.
- Writes a Markdown report to `./results/report.md` with a comparison table (cost, latency, generation date, video link).
- Caches per-model results in `./results/cache.json` so reruns skip already-generated models - add a new model without paying to regenerate the rest.
- Tracks provider-reported cost when available.

## Models Covered

Full list in [`src/models.ts`](./src/models.ts). Spans every text-to-video model currently exposed by the Vercel AI Gateway:

- **Alibaba Wan** - v2.5 (preview), v2.6
- **ByteDance Seedance** - v1.0 Lite, v1.0 Pro, v1.0 Pro Fast, v1.5 Pro, 2.0, 2.0 Fast
- **Google Veo** - 3.0, 3.0 Fast, 3.1, 3.1 Fast
- **KlingAI Kling** - v2.5 Turbo, v2.6, v3.0 (each with std and pro mode as separate entries)
- **xAI Grok Imagine Video**

Each model has an `enabled` flag in `src/models.ts`. Only the entries with `enabled: true` are considered for generation on the next run - everything else stays out of the candidate list but remains visible in the report if it has a cached result.

Provider-specific quirks (Veo audio/duration constraints, Kling resolution rejection, Wan aspect ratio rejection, etc.) and the mode-variant pattern (`gatewayId` field) are documented in [MODEL-QUIRKS.md](./MODEL-QUIRKS.md).

## Requirements

- [Bun](https://bun.sh)

## Install

```bash
bun install
```

## Configure

### Create and add Vercel AI Gateway API Key

Create an API key at https://vercel.com/d?to=/[team]/~/ai-gateway/api-keys

```bash
cp .env.example .env
```

Set the `AI_GATEWAY_API_KEY` environment variable in `.env`:

```bash
export AI_GATEWAY_API_KEY=your_key_here
```

### Configure benchmark

Edit [src/config.ts](./src/config.ts) to change:

- the benchmark prompt
- aspect ratio
- resolution
- duration in seconds
- request delay
- output paths

Edit [src/models.ts](./src/models.ts) to enable or disable models (`enabled: true/false`) or adjust model-specific overrides (`aspectRatio`, `resolution`, `duration`, `providerOptions`, `skipResolution`, `skipAspectRatio`).

For providers that expose multiple modes for the same underlying model (e.g. Kling `std` vs `pro`), add each mode as a separate entry with a distinct `id` and a shared `gatewayId`. See the [Mode variants section in MODEL-QUIRKS.md](./MODEL-QUIRKS.md#mode-variants) for the pattern.

## Run

```bash
bun start                              # cached: skip every model with a valid cache entry
bun start --force                      # ignore cache, regenerate every enabled model
bun start --only klingai/kling-v3.0-t2v,xai/grok-imagine-video
                                       # regenerate only the listed ids (others stay cached)
```

`--regenerate-all` is accepted as an alias for `--force`.

### Caching

Per-model results are cached in `./results/cache.json` (keyed by `id`, with inputs as the cache key: prompt + duration + resolution + aspectRatio). The cache lets you add a new model to `src/models.ts` and run only that one without paying to regenerate the existing entries.

- A cache hit is reused when the model's effective inputs are unchanged **and** the saved video file is still on disk.
- Changing the global `prompt` in `src/config.ts` invalidates every entry.
- Changing a per-model override (duration, resolution, aspectRatio, mode) invalidates that entry only.
- Failures aren't cached - failed models retry on the next run.
- If `cache.json` doesn't exist but `results/report.md` does, the cache is auto-seeded from the report on first run.

### Runtime expectations

> Each video generation call can take 1-10+ minutes. The benchmark uses a custom gateway in [`src/gateway.ts`](./src/gateway.ts) with an extended 15-minute Undici `Agent` timeout to keep long fetches alive. Expect a full run to cost a few USD - check provider pricing before running.

> Models are called sequentially with a deliberate 65-second delay between requests (`delayBetweenRequestsMs` in [src/config.ts](./src/config.ts)). KlingAI on the Vercel AI Gateway enforces a 1 request/minute quota for accounts with balances below $100 - waiting > 60s between calls keeps multi-model runs from tripping that quota. See [MODEL-QUIRKS.md](./MODEL-QUIRKS.md) for details.

## Output

The CLI prints progress for each model and runs three phases:

1. **Generation** - for every enabled model, either reports `CACHED (<date> $<cost>)` and skips it, or calls the gateway and saves the output to `./results/videos/`. Cache entries are persisted to `./results/cache.json` after every model.
2. **Report** - writes `./results/report.md` with a comparison table containing:
   - model ID
   - cost (gateway-reported when available)
   - latency (wall-clock seconds, measured by the client)
   - generation date (per-row `YYYY-MM-DD` - rows can come from different runs)
   - link to the saved `.mp4`

   The report includes every model with a cache entry, even if it's currently `enabled: false` - disabling a model skips its regeneration but keeps it in the comparison.
3. **Charts** - renders cost and latency bar charts to `./results/videos/charts/{cost.png, latency.png}`.

## Notes

- All models are generating video with audio, but for some models it needs to be set explicitly.
- The runner uses `result.videos[i].uint8Array` to save bytes to disk; `mediaType` provides the file extension (`.mp4` for all current models).
- Cost metadata comes from `result.providerMetadata?.gateway?.cost`.
- Per-provider parameter constraints (Veo `duration` in `{4,6,8}`, Kling rejecting `resolution`, Wan rejecting `aspectRatio`, etc.) are handled via per-model overrides in `src/models.ts`. See [MODEL-QUIRKS.md](./MODEL-QUIRKS.md) for the full list.

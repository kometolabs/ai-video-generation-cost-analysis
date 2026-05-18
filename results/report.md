# AI Video Model Benchmark

**Last updated:** 2026-05-18T14:28:40.483Z  
**Prompt:** A golden retriever puppy chasing a butterfly through a sunflower field at golden hour, cinematic shallow depth of field, soft warm light, slow camera dolly forward.

| Model | Cost | Latency | Generated | Video |
| ----- | ---- | ------- | --------- | ----- |
| `alibaba/wan-v2.6-t2v` | $0.5 | 53.4s | 2026-05-17 | [video](./videos/alibaba-wan-v2.6-t2v.mp4) |
| `bytedance/seedance-2.0` | $0.7623 | 170.4s | 2026-05-17 | [video](./videos/bytedance-seedance-2.0.mp4) |
| `google/veo-3.1-generate-001` | $1.6 | 54.6s | 2026-05-17 | [video](./videos/google-veo-3.1-generate-001.mp4) |
| `klingai/kling-v3.0-t2v` | $1.270332 | 41.6s | 2026-05-17 | [video](./videos/klingai-kling-v3.0-t2v.mp4) |
| `xai/grok-imagine-video` | $0.35 | 49.6s | 2026-05-17 | [video](./videos/xai-grok-imagine-video.mp4) |

**Total spent:** $4.482632

_Latency is wall time per video, measured by the benchmark script._  
_Cost is returned by the gateway, so it should be accurate._  
_Generated is the date each row's video was produced - rows may be from different runs (cache hits aren't re-generated)._  
_Click "video" to download the `.mp4`. GitHub does not play repo-local videos inline._
# AI Video Model Benchmark

**Last updated:** 2026-11-07T17:32:49.395Z  
**Prompt:** A golden retriever puppy chasing a butterfly through a sunflower field at golden hour, cinematic shallow depth of field, soft warm light, slow camera dolly forward.  
**Duration:** 4-5s  
**Resolution:** 1280x720, 720p  
**Aspect ratio:** 16:9

| Model | Cost | Generation time | Generated | Duration | Resolution | Audio | Video |
| ----- | ---- | --------------- | --------- | -------- | ---------- | ----- | ----- |
| `alibaba/wan-v2.5-t2v-preview` | $0.5 | 115.3s | 2026-05-18 | 5.0s | 1280x720 | yes | [video](./videos/alibaba-wan-v2.5-t2v-preview.mp4) |
| `alibaba/wan-v2.6-t2v` | $0.5 | 53.4s | 2026-05-17 | 5.0s | 1280x720 | yes | [video](./videos/alibaba-wan-v2.6-t2v.mp4) |
| `bytedance/seedance-v1.0-lite-t2v` | - | FAILED | 2026-05-18 | - | - | - | - |
| `bytedance/seedance-v1.0-pro` | $0.2575 | 53.0s | 2026-05-18 | 5.0s | 1248x704 | no | [video](./videos/bytedance-seedance-v1.0-pro.mp4) |
| `bytedance/seedance-v1.0-pro-fast` | $0.103 | 44.3s | 2026-05-18 | 5.0s | 1248x704 | no | [video](./videos/bytedance-seedance-v1.0-pro-fast.mp4) |
| `bytedance/seedance-v1.5-pro` | $0.1295 | 73.9s | 2026-05-18 | 5.0s | 1280x720 | yes | [video](./videos/bytedance-seedance-v1.5-pro.mp4) |
| `bytedance/seedance-2.0` | $0.7623 | 170.4s | 2026-05-17 | 5.1s | 1280x720 | yes | [video](./videos/bytedance-seedance-2.0.mp4) |
| `bytedance/seedance-2.0-fast` | $0.60984 | 117.9s | 2026-05-18 | 5.1s | 1280x720 | yes | [video](./videos/bytedance-seedance-2.0-fast.mp4) |
| `google/veo-3.0-generate-001` | $1.6 | 85.1s | 2026-05-18 | 4.0s | 1280x720 | yes | [video](./videos/google-veo-3.0-generate-001.mp4) |
| `google/veo-3.0-fast-generate-001` | $0.6 | 64.1s | 2026-05-18 | 4.0s | 1280x720 | yes | [video](./videos/google-veo-3.0-fast-generate-001.mp4) |
| `google/veo-3.1-generate-001` | $1.6 | 54.6s | 2026-05-17 | 4.0s | 1280x720 | yes | [video](./videos/google-veo-3.1-generate-001.mp4) |
| `google/veo-3.1-fast-generate-001` | $0.6 | 65.6s | 2026-05-18 | 4.0s | 1280x720 | yes | [video](./videos/google-veo-3.1-fast-generate-001.mp4) |
| `klingai/kling-v2.5-turbo-t2v` | $0.211722 | 47.8s | 2026-05-18 | 5.0s | 1280x720 | no | [video](./videos/klingai-kling-v2.5-turbo-t2v.mp4) |
| `klingai/kling-v2.5-turbo-t2v-pro` | $0.35287 | 81.5s | 2026-05-18 | 5.0s | 1920x1080 | no | [video](./videos/klingai-kling-v2.5-turbo-t2v-pro.mp4) |
| `klingai/kling-v2.6-t2v` | $0.211722 | 57.0s | 2026-05-18 | 5.0s | 1280x720 | no | [video](./videos/klingai-kling-v2.6-t2v.mp4) |
| `klingai/kling-v2.6-t2v-pro` | $0.70574 | 90.9s | 2026-05-18 | 5.0s | 1920x1080 | yes | [video](./videos/klingai-kling-v2.6-t2v-pro.mp4) |
| `klingai/kling-v3.0-t2v` | $1.270332 | 41.6s | 2026-05-17 | 5.0s | 1280x720 | yes | [video](./videos/klingai-kling-v3.0-t2v.mp4) |
| `klingai/kling-v3.0-t2v-pro` | $1.693776 | 83.0s | 2026-05-18 | 5.0s | 1920x1080 | yes | [video](./videos/klingai-kling-v3.0-t2v-pro.mp4) |
| `xai/grok-imagine-video` | $0.35 | 49.6s | 2026-05-17 | 5.0s | 1280x720 | yes | [video](./videos/xai-grok-imagine-video.mp4) |

**Total spent:** $12.058302

_Each model generated one video, so each generation time is a single measurement._  
_Generation time is wall time per video, measured by the benchmark script._  
_Cost is returned by the gateway, so it should be accurate._  
_Generated is the date each row's video was produced - rows may be from different runs (cache hits aren't re-generated)._  
_Duration, Resolution and Audio are measured from each saved video with ffprobe, not taken from the requested settings. Costs are only like-for-like between rows where these match._  
_Click "video" to download the `.mp4`. GitHub does not play repo-local videos inline._
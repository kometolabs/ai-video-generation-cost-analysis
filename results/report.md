# AI Video Model Benchmark

**Run:** 2026-05-17T15:34:16.669Z  
**Prompt:** A golden retriever puppy chasing a butterfly through a sunflower field at golden hour, cinematic shallow depth of field, soft warm light, slow camera dolly forward.

| Model | Cost | Latency | Duration | Resolution | Video |
| ----- | ---- | ------- | -------- | ---------- | ----- |
| `alibaba/wan-v2.6-t2v` | $0.5 | 53.4s | 5s | 1280x720 | <video src="./videos/alibaba-wan-v2.6-t2v.mp4" controls width="320"></video> |
| `bytedance/seedance-2.0` | $0.7623 | 170.4s | 5s | 1280x720 | <video src="./videos/bytedance-seedance-2.0.mp4" controls width="320"></video> |
| `google/veo-3.1-generate-001` | $1.6 | 54.6s | 4s | 720p | <video src="./videos/google-veo-3.1-generate-001.mp4" controls width="320"></video> |
| `klingai/kling-v3.0-t2v` | $0.846888 | 45.6s | 5s | (16:9) | <video src="./videos/klingai-kling-v3.0-t2v.mp4" controls width="320"></video> |
| `xai/grok-imagine-video` | $0.35 | 49.6s | 5s | 1280x720 | <video src="./videos/xai-grok-imagine-video.mp4" controls width="320"></video> |

**Total spent:** $4.059188

_Latency is wall time per video, measured by the benchmark script._  
_Cost is returned by the gateway, so it should be accurate._  
_Videos are embedded as HTML5 `<video>` tags - GitHub renders them inline._
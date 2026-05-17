// Central config for the cost analysis benchmark.
// Edit this file to change the prompt, aspect ratio, and other defaults.
export const config = {
  // Standard prompt used to test all models.
  // Keep it consistent across runs so cost comparisons are meaningful.
  prompt:
    'A golden retriever puppy chasing a butterfly through a sunflower field at golden hour, cinematic shallow depth of field, soft warm light, slow camera dolly forward.',

  // Aspect ratio for video models that support it.
  aspectRatio: '16:9',

  // Resolution for video models that accept the `resolution` parameter.
  // Per-model overrides may use different formats (e.g. Veo expects '720p').
  resolution: '1280x720',

  // Duration in seconds. Per-model overrides apply where the global value
  // is not in the model's allowed set (e.g. Veo accepts only 4/6/8).
  duration: 5,

  // Delay in ms between model requests to avoid rate limiting.
  delayBetweenRequestsMs: 2000,

  // Directory for saved videos.
  outputDir: './results/videos',

  // Directory for generated chart PNGs (cost, latency).
  chartsDir: './results/videos/charts',

  // Path for the generated Markdown report.
  reportPath: './results/report.md',
}

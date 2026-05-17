import { experimental_generateVideo as generateVideo } from 'ai'
import fs from 'node:fs'
import path from 'node:path'
import { gateway } from '../gateway.js'
import type { ModelConfig, RunResult } from '../types.js'

export interface GenerateVideoOptions {
  outputDir: string
  saveVideos: boolean
  defaults: {
    aspectRatio: string
    resolution: string
    duration: number
  }
}

// Runs a text-to-video model via Vercel AI Gateway.
// The provider prefix in model.id (e.g. 'xai/...', 'klingai/...', 'google/...')
// routes automatically through the gateway. Videos are returned in result.videos
// with uint8Array, base64, and mediaType populated.
export async function runGenerateVideo(
  model: ModelConfig,
  prompt: string,
  opts: GenerateVideoOptions,
): Promise<RunResult> {
  const start = Date.now()
  const savedVideos: string[] = []

  try {
    const callArgs: Parameters<typeof generateVideo>[0] = {
      model: gateway.video(model.id),
      prompt,
      aspectRatio: (model.aspectRatio ?? opts.defaults.aspectRatio) as Parameters<
        typeof generateVideo
      >[0]['aspectRatio'],
      duration: model.duration ?? opts.defaults.duration,
    }

    // Omit `resolution` for providers that reject it (e.g. Kling).
    if (!model.skipResolution) {
      callArgs.resolution = (model.resolution ?? opts.defaults.resolution) as Parameters<
        typeof generateVideo
      >[0]['resolution']
    }

    if (model.providerOptions) {
      callArgs.providerOptions = model.providerOptions
    }

    const result = await generateVideo(callArgs)

    const wallLatencyMs = Date.now() - start

    let mediaType: string | undefined
    if (opts.saveVideos && result.videos.length > 0) {
      fs.mkdirSync(opts.outputDir, { recursive: true })

      for (const video of result.videos) {
        mediaType = video.mediaType ?? mediaType
        const ext = video.mediaType?.split('/')[1] ?? 'mp4'
        const slug = model.id.replace('/', '-')
        const filepath = path.join(opts.outputDir, `${slug}.${ext}`)
        await fs.promises.writeFile(filepath, Buffer.from(video.uint8Array))
        savedVideos.push(filepath)
      }
    }

    // biome-ignore lint/suspicious/noExplicitAny: gateway metadata is provider-shaped
    const gatewayMeta = result.providerMetadata?.gateway as any

    return {
      model,
      success: true,
      wallLatencyMs,
      videoCount: result.videos.length,
      savedVideos,
      mediaType,
      cost: gatewayMeta?.cost,
    }
  } catch (error) {
    return {
      model,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      wallLatencyMs: Date.now() - start,
      videoCount: 0,
      savedVideos: [],
    }
  }
}

import { spawnSync } from 'node:child_process'

export interface VideoProbe {
  durationSec?: number
  width?: number
  height?: number
  hasAudio: boolean
}

interface FfprobeOutput {
  streams?: { codec_type?: string; width?: number; height?: number }[]
  format?: { duration?: string }
}

// Reads the actual duration, resolution and audio track of a saved video with
// ffprobe, so the report shows what each model really produced rather than the
// settings we requested. Returns null when ffprobe isn't installed or the file
// can't be read - the report then falls back to "-" instead of failing.
export function probeVideo(filePath: string): VideoProbe | null {
  const res = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', filePath],
    { encoding: 'utf-8' },
  )
  if (res.error || res.status !== 0) return null

  try {
    const data = JSON.parse(res.stdout) as FfprobeOutput
    const video = data.streams?.find((s) => s.codec_type === 'video')
    const duration = data.format?.duration != null ? parseFloat(data.format.duration) : Number.NaN
    return {
      durationSec: Number.isFinite(duration) ? duration : undefined,
      width: video?.width,
      height: video?.height,
      hasAudio: data.streams?.some((s) => s.codec_type === 'audio') ?? false,
    }
  } catch {
    return null
  }
}

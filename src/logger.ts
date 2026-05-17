import path from 'node:path'
import { config } from './config.js'
import type { RunResult } from './types.js'

function formatPrice(cost?: string): string {
  if (cost == null) return '-'
  // Trim float-precision garbage (e.g. 0.014000000000000002 -> 0.014)
  // while keeping legitimate precision (e.g. 0.0390369).
  const cleaned = parseFloat(Number(cost).toFixed(8))
  return `$${cleaned}`
}

export async function writeReport(prompt: string, results: RunResult[], reportPath: string): Promise<string> {
  const reportDir = path.dirname(path.resolve(reportPath))
  const toRel = (p: string) => {
    const rel = path.relative(reportDir, path.resolve(p))
    // Prefix sibling paths with ./ for explicit relativity (Markdown-friendly).
    return rel.startsWith('.') ? rel : `./${rel}`
  }

  const rows = results.map((r) => {
    const model = `\`${r.model.id}\``
    const price = formatPrice(r.cost)
    const latency = r.success ? `${(r.wallLatencyMs / 1000).toFixed(1)}s` : 'FAILED'
    const duration = `${r.model.duration ?? config.duration}s`
    const resolution = r.model.skipResolution
      ? `(${r.model.aspectRatio ?? config.aspectRatio})`
      : (r.model.resolution ?? config.resolution)

    let video = '-'
    if (r.savedVideos[0]) {
      const src = toRel(r.savedVideos[0])
      video = `<video src="${src}" controls width="320"></video>`
    }

    return `| ${model} | ${price} | ${latency} | ${duration} | ${resolution} | ${video} |`
  })

  const totalCost = results.reduce((sum, r) => sum + (r.cost != null ? parseFloat(r.cost) : 0), 0)
  const totalCostStr = `$${parseFloat(totalCost.toFixed(8))}`

  // Trailing double-space forces a Markdown <br> between adjacent lines.
  const br = '  '

  const md = [
    `# AI Video Model Benchmark`,
    ``,
    `**Run:** ${new Date().toISOString()}${br}`,
    `**Prompt:** ${prompt}`,
    ``,
    `| Model | Cost | Latency | Duration | Resolution | Video |`,
    `| ----- | ---- | ------- | -------- | ---------- | ----- |`,
    ...rows,
    ``,
    `**Total spent:** ${totalCostStr}`,
    ``,
    `_Latency is wall time per video, measured by the benchmark script._${br}`,
    `_Cost is returned by the gateway, so it should be accurate._${br}`,
    `_Videos are embedded as HTML5 \`<video>\` tags - GitHub renders them inline._`,
  ].join('\n')

  await Bun.write(reportPath, md)
  return path.resolve(reportPath)
}

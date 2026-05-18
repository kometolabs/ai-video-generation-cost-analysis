import path from 'node:path'
import type { ModelConfig, RunCache } from './types.js'

function formatPrice(cost?: string): string {
  if (cost == null) return '-'
  // Trim float-precision garbage (e.g. 0.014000000000000002 -> 0.014)
  // while keeping legitimate precision (e.g. 0.0390369).
  const cleaned = parseFloat(Number(cost).toFixed(8))
  return `$${cleaned}`
}

function formatDate(iso: string): string {
  // YYYY-MM-DD is enough for at-a-glance freshness in the table.
  return iso.slice(0, 10)
}

export async function writeReport(
  prompt: string,
  models: ModelConfig[],
  cache: RunCache,
  reportPath: string,
): Promise<string> {
  const reportDir = path.dirname(path.resolve(reportPath))
  const toRel = (p: string) => {
    const rel = path.relative(reportDir, path.resolve(p))
    // Prefix sibling paths with ./ for explicit relativity (Markdown-friendly).
    return rel.startsWith('.') ? rel : `./${rel}`
  }

  const rows = models.map((model) => {
    const entry = cache.entries[model.id]
    const id = `\`${model.id}\``

    if (!entry) {
      return `| ${id} | - | - | - | - |`
    }

    const price = formatPrice(entry.cost)
    const latency = entry.success ? `${(entry.wallLatencyMs / 1000).toFixed(1)}s` : 'FAILED'
    const generated = formatDate(entry.generatedAt)
    const video = entry.videoPath ? `[video](${toRel(entry.videoPath)})` : '-'

    return `| ${id} | ${price} | ${latency} | ${generated} | ${video} |`
  })

  const totalCost = models.reduce((sum, model) => {
    const cost = cache.entries[model.id]?.cost
    return sum + (cost != null ? parseFloat(cost) : 0)
  }, 0)
  const totalCostStr = `$${parseFloat(totalCost.toFixed(8))}`

  // Trailing double-space forces a Markdown <br> between adjacent lines.
  const br = '  '

  const md = [
    `# AI Video Model Benchmark`,
    ``,
    `**Last updated:** ${new Date().toISOString()}${br}`,
    `**Prompt:** ${prompt}`,
    ``,
    `| Model | Cost | Latency | Generated | Video |`,
    `| ----- | ---- | ------- | --------- | ----- |`,
    ...rows,
    ``,
    `**Total spent:** ${totalCostStr}`,
    ``,
    `_Latency is wall time per video, measured by the benchmark script._${br}`,
    `_Cost is returned by the gateway, so it should be accurate._${br}`,
    `_Generated is the date each row's video was produced - rows may be from different runs (cache hits aren't re-generated)._${br}`,
    `_Click "video" to download the \`.mp4\`. GitHub does not play repo-local videos inline._`,
  ].join('\n')

  await Bun.write(reportPath, md)
  return path.resolve(reportPath)
}

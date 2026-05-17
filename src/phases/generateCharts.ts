import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import fs from 'node:fs'
import path from 'node:path'

export interface ChartOptions {
  reportPath: string
  chartsDir: string
  width?: number
  height?: number
}

interface ChartSpec {
  labels: string[]
  values: number[]
  label: string
  unit: string
  color: string
  filename: string
}

interface ReportRow {
  model: string
  price: number
  latency: number
}

const FONT = 'Inter, sans-serif'
const BG = '#ffffff'

// Parses the Markdown comparison table from report.md.
// Expects rows shaped as: | `model/id` | $price | latencys | video |
// Failed rows (latency = "FAILED") and rows without a numeric price are dropped.
function parseReport(md: string): ReportRow[] {
  const rows = md
    .split('\n')
    .filter((line) => line.startsWith('|') && !/^[\s|:-]+$/.test(line))
    .slice(1) // skip header row

  return rows
    .map((row) => {
      const cols = row
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
      const model = cols[0]?.replace(/`/g, '') ?? ''
      const price = parseFloat((cols[1] ?? '').replace('$', ''))
      const latency = parseFloat((cols[2] ?? '').replace('s', ''))
      return { model, price, latency }
    })
    .filter((r) => r.model && Number.isFinite(r.price) && Number.isFinite(r.latency))
}

export async function generateCharts(opts: ChartOptions): Promise<string[]> {
  const width = opts.width ?? 1200
  const height = opts.height ?? 600

  if (!fs.existsSync(opts.reportPath)) return []
  const md = await Bun.file(opts.reportPath).text()
  const data = parseReport(md)
  if (data.length === 0) return []

  fs.mkdirSync(opts.chartsDir, { recursive: true })

  const date = new Date().toISOString().slice(0, 10)

  const byPrice = [...data].sort((a, b) => a.price - b.price)
  const byLatency = [...data].sort((a, b) => a.latency - b.latency)

  const renderer = new ChartJSNodeCanvas({ width, height, backgroundColour: BG })

  const specs: ChartSpec[] = [
    {
      labels: byPrice.map((d) => d.model),
      values: byPrice.map((d) => d.price),
      label: 'Cost per video ($)',
      unit: '$',
      color: '#3b82f6',
      filename: 'cost.png',
    },
    {
      labels: byLatency.map((d) => d.model),
      values: byLatency.map((d) => d.latency),
      label: 'Latency (seconds)',
      unit: '',
      color: '#10b981',
      filename: 'latency.png',
    },
  ]

  const written: string[] = []
  for (const spec of specs) {
    const buffer = await renderer.renderToBuffer({
      type: 'bar',
      data: {
        labels: spec.labels,
        datasets: [
          {
            label: spec.label,
            data: spec.values,
            backgroundColor: spec.color,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: false,
        layout: { padding: { top: 16, right: 32, bottom: 16, left: 16 } },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `${spec.label} - ${date}`,
            font: { size: 16, family: FONT, weight: 'bold' },
            padding: { bottom: 16 },
          },
          tooltip: { enabled: false },
          subtitle: {
            display: true,
            text: '@kometolabs & @kkomelin',
            position: 'bottom',
            align: 'center',
            color: '#9ca3af',
            font: { size: 13, family: FONT },
            padding: { top: 12 },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (v: number | string) => `${spec.unit}${v}`,
              font: { size: 11, family: FONT },
            },
            grid: { color: '#f0f0f0' },
          },
          y: {
            ticks: { font: { size: 11, family: FONT } },
            grid: { display: false },
          },
        },
      },
    })

    const out = path.join(opts.chartsDir, spec.filename)
    fs.writeFileSync(out, buffer)
    written.push(out)
  }
  return written
}

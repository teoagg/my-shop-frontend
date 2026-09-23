import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export type ComparisonRow = {
  page: string; platform: string; ok: number; failed: number
  median_ms: number | null; mean_ms: number | null; p95_ms: number | null
  mean_header_ms: number | null; median_bytes: number | null
}
export type ComparisonReport = {
  started_at: string; finished_at: string; execution_host: string; method: string
  summary: ComparisonRow[]
  observations: { page: string; platform: string; warmup: boolean; ok: boolean; headers?: Record<string, string | null> }[]
}

export async function getComparisonReport(): Promise<ComparisonReport | null> {
  try {
    const report = JSON.parse(await readFile(resolve(process.cwd(), 'evaluation/published/comparison-latest.json'), 'utf8'))
    if (!report.finished_at || !Array.isArray(report.summary) || report.summary.length !== 8 || !Array.isArray(report.observations)) return null
    return report
  } catch { return null }
}

export function comparisonCsv(report: ComparisonReport) {
  const fields = ['page', 'platform', 'ok', 'failed', 'median_ms', 'mean_ms', 'p95_ms', 'mean_header_ms', 'median_bytes'] as const
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return '\uFEFF' + [fields.join(','), ...report.summary.map(row => fields.map(key => quote(row[key])).join(','))].join('\r\n') + '\r\n'
}

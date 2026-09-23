import { comparisonCsv, getComparisonReport } from '@/lib/comparison-report'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format') || 'json'
  if (!['csv', 'json'].includes(format)) return Response.json({ error: 'Unsupported format' }, { status: 400 })
  const report = await getComparisonReport()
  if (!report) return Response.json({ error: 'No published comparison' }, { status: 404 })
  return new Response(format === 'csv' ? comparisonCsv(report) : JSON.stringify(report, null, 2), {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="store-comparison.${format}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

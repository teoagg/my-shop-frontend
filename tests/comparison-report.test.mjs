import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function load(file, dependencies = {}) {
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const context = { exports: {}, process, URL, Response, require: name => dependencies[name] || require(name) }
  vm.runInNewContext(code, context)
  return context.exports
}
const library = load('../lib/comparison-report.ts')

test('published report preserves all 80 measurements and CSV matches the eight result rows', async () => {
  const report = await library.getComparisonReport()
  assert.equal(report.summary.length, 8)
  assert.equal(report.observations.filter(row => !row.warmup).length, 80)
  const csv = library.comparisonCsv(report)
  assert.equal(csv.trim().split('\r\n').length, 9)
  assert.ok(csv.includes('WordPress + WooCommerce'))
  assert.ok(!JSON.stringify(report).includes('"error":'))
})

test('download route supports JSON/CSV and rejects other formats; exposes no run action', async () => {
  const route = load('../app/api/evaluation/comparison/route.ts', { '@/lib/comparison-report': library })
  assert.equal(route.POST, undefined)
  for (const format of ['json', 'csv']) {
    const result = await route.GET(new Request(`https://shop.tagg.gr/api/evaluation/comparison?format=${format}`))
    assert.equal(result.status, 200)
    assert.equal(result.headers.get('cache-control'), 'no-store')
    assert.ok(result.headers.get('content-disposition').includes(`.${format}`))
    if (format === 'json') assert.equal((await result.json()).summary.length, 8)
  }
  assert.equal((await route.GET(new Request('https://shop.tagg.gr/api/evaluation/comparison?format=exe'))).status, 400)
  const missing = load('../app/api/evaluation/comparison/route.ts', { '@/lib/comparison-report': { ...library, getComparisonReport: async () => null } })
  assert.equal((await missing.GET(new Request('https://shop.tagg.gr/api/evaluation/comparison'))).status, 404)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const code = ts.transpileModule(readFileSync(new URL('../lib/analytics.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function fixture(url, beaconResult = true) {
  const requests = [], beacons = []
  const context = {
    exports: {}, URL, Blob,
    window: { location: { origin: 'https://shop.tagg.gr', href: 'https://shop.tagg.gr/products/item' } },
    crypto: { randomUUID: () => 'd405da4c-aec3-4af8-95f7-d33bffbcfcb4' },
    navigator: { sendBeacon: (...args) => { beacons.push(args); return beaconResult } },
    fetch: (...args) => { requests.push(args); return Promise.resolve({ ok: true }) },
    require: name => name === '@/lib/ab-testing'
      ? { getAbVariant: () => 'A', getSessionId: () => 'test-session' }
      : { getAnalyticsUrl: () => url },
  }
  vm.runInNewContext(code, context)
  context.exports.trackInteraction({ eventType: 'view', documentId: 'published-product' })
  return { requests, beacons }
}

test('cross-origin analytics uses anonymous keepalive fetch instead of credentialed beacon', () => {
  const { requests, beacons } = fixture('https://analytics.example/track')
  assert.equal(beacons.length, 0)
  assert.equal(requests.length, 1)
  assert.equal(requests[0][1].credentials, 'omit')
  assert.equal(requests[0][1].keepalive, true)
  assert.equal(JSON.parse(requests[0][1].body).data.eventId, 'd405da4c-aec3-4af8-95f7-d33bffbcfcb4')
})

test('same-origin beacon falls back without changing the event identity', async () => {
  const { requests, beacons } = fixture('/track', false)
  assert.equal(beacons.length, 1)
  assert.equal(requests.length, 1)
  assert.equal(await beacons[0][1].text(), requests[0][1].body)
  assert.equal(fixture('/track').requests.length, 0)
})

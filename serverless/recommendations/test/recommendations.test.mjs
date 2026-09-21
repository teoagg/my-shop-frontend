import test from 'node:test'
import assert from 'node:assert/strict'
import { recommend } from '../engine.mjs'
import { createServer } from 'node:http'
import { mkdtemp, cp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'

const product = (id, categories = [], extra = {}) => ({ id, documentId: `p${id}`, title: `Product ${id}`, inStock: true, createdAt: `2026-01-${String(id).padStart(2, '0')}`, categories: categories.map(id => ({ id })), ...extra })
const products = [product(1, [1]), product(2, [1]), product(3), product(4), product(5), product(6, [], { inStock: false })]
const event = (id, eventType, sessionId = 'shared') => ({ product: { id, documentId: `p${id}` }, eventType, sessionId })
const interactions = [event(1, 'view'), event(2, 'view'), event(3, 'purchase'), event(6, 'purchase'), event(4, 'view', 'other')]

test('weighted collaboration, stock filtering, uniqueness and fallback fill', () => {
  const result = recommend(products, interactions, { documentId: 'p1', limit: 4 })
  assert.deepEqual(result.map(p => p.id), [3, 2, 4, 5])
  assert.deepEqual(result.map(p => p.recommendationReason), ['collaborative', 'collaborative', 'popular', 'latest'])
})
test('cold dataset uses category then newest; documentId takes precedence', () => {
  assert.deepEqual(recommend(products, [], { documentId: 'p1', productId: '5', limit: 3 }).map(p => p.id), [2, 5, 4])
  assert.throws(() => recommend(products, [], { documentId: 'missing' }), { status: 404 })
  assert.equal(recommend(products, [], { productId: '1', limit: '-2' }).length, 1)
  assert.equal(recommend(products, [], { productId: '1', limit: 'bad' }).length, 4)
})
test('document identity bridges draft/published numeric ids', () => {
  const result = recommend(products, [{ ...event(1, 'view'), product: { id: 101, documentId: 'p1' } }, event(3, 'purchase')], { documentId: 'p1', limit: 1 })
  assert.equal(result[0].id, 3)
})

test('copied service works without repository dependencies; only reads raw data APIs', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'shop-recommendations-'))
  await cp(new URL('../', import.meta.url), dir, { recursive: true })
  let child, upstream
  t.after(async () => {
    if (child && child.exitCode === null) await new Promise(resolve => { child.once('exit', resolve); child.kill() })
    if (upstream) { upstream.closeAllConnections(); await new Promise(resolve => upstream.close(resolve)) }
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  })
  let mode = 'ok'
  const requests = []
  upstream = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    requests.push(url.pathname)
    assert.equal(req.headers.authorization, 'Bearer fixture-token')
    if (mode === 'denied') { res.writeHead(403); res.end('{"error":{}}'); return }
    if (mode === 'invalid') { res.end('<html>Unavailable</html>'); return }
    if (mode === 'slow') { setTimeout(() => res.end('{}'), 200); return }
    const values = url.pathname === '/api/products' ? products : interactions
    assert.ok(['/api/products', '/api/interactions'].includes(url.pathname))
    const page = Number(url.searchParams.get('pagination[page]'))
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ data: values.slice((page - 1) * 2, page * 2), meta: { pagination: { pageCount: Math.ceil(values.length / 2) } } }))
  })
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve))
  const env = { ...process.env, PORT: '0', HOST: '127.0.0.1', STRAPI_URL: `http://127.0.0.1:${upstream.address().port}`, STRAPI_API_TOKEN: 'fixture-token', UPSTREAM_TIMEOUT_MS: '100', ALLOWED_ORIGIN: 'https://shop.tagg.gr' }
  child = spawn(process.execPath, ['server.mjs'], { cwd: dir, env, stdio: ['ignore', 'pipe', 'pipe'] })
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Service startup timeout')), 5000)
    child.stdout.on('data', data => { const match = String(data).match(/port (\d+)/); if (match) { clearTimeout(timer); resolve(match[1]) } })
    child.on('error', reject)
    child.on('exit', code => { clearTimeout(timer); reject(new Error(`Service exited ${code}`)) })
  })
  const base = `http://127.0.0.1:${port}`
  const response = await fetch(`${base}/recommendations?documentId=p1&limit=4`)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://shop.tagg.gr')
  const body = await response.json()
  assert.deepEqual(body.data.map(p => p.id), [3, 2, 4, 5])
  assert.ok(!JSON.stringify(body).includes('shared'))
  assert.ok(!requests.includes('/api/recommendations'))
  assert.equal((await fetch(`${base}/health`)).status, 200)
  assert.equal((await fetch(`${base}/recommendations`, { method: 'OPTIONS' })).status, 204)
  assert.equal((await fetch(`${base}/recommendations`, { method: 'POST' })).status, 405)
  assert.equal((await fetch(`${base}/recommendations?documentId=missing`)).status, 404)
  mode = 'denied'
  assert.equal((await fetch(`${base}/recommendations?documentId=p1`)).status, 502)
  mode = 'invalid'
  assert.equal((await fetch(`${base}/recommendations?documentId=p1`)).status, 502)
  mode = 'slow'
  assert.equal((await fetch(`${base}/recommendations?documentId=p1`)).status, 504)
  mode = 'ok'
  const code = `import { handler } from './handler.mjs'; console.log(JSON.stringify(await handler({requestContext:{http:{method:'GET'}},queryStringParameters:{documentId:'p1',limit:'1'}})))`
  const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', code], { cwd: dir, env })
  const lambda = JSON.parse(stdout)
  assert.equal(lambda.statusCode, 200)
  assert.equal(JSON.parse(lambda.body).data[0].id, 3)
  const missing = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', code], { cwd: dir, env: { ...env, STRAPI_API_TOKEN: '' } })
  assert.equal(JSON.parse(missing.stdout).statusCode, 503)
})

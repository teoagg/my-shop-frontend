import { createServer } from 'node:http'
import { existsSync } from 'node:fs'

// Kept inside each service so its folder can be deployed on its own.
export function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
      ...headers,
    },
    body: statusCode === 204 ? '' : JSON.stringify(body),
  }
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

export function parseBody(event) {
  if (!event.body) return {}
  try {
    const value = typeof event.body === 'object' ? event.body : JSON.parse(
      event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body
    )
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value
  } catch {
    throw httpError(400, 'Request body must be a JSON object.')
  }
}

export function query(event) {
  return event.queryStringParameters || {}
}

export function strapiBaseUrl() {
  const value = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL
  if (!value) throw httpError(503, 'STRAPI_URL is not configured.')
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    return url.origin
  } catch {
    throw httpError(503, 'STRAPI_URL must be an HTTP or HTTPS URL.')
  }
}

export async function fetchUpstream(url, options = {}) {
  const timeout = Number(process.env.UPSTREAM_TIMEOUT_MS || 10000)
  if (!Number.isInteger(timeout) || timeout < 1) throw httpError(503, 'Invalid UPSTREAM_TIMEOUT_MS.')
  try {
    const response = await fetch(url, { ...options, signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout) })
    // Consume within the timeout, including slow response bodies.
    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { throw httpError(502, 'Strapi returned an invalid JSON response.') }
    return { ok: response.ok, status: response.status, json: async () => data }
  } catch (error) {
    if (error.status) throw error
    throw httpError(error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : 502,
      error.name === 'TimeoutError' || error.name === 'AbortError' ? 'Strapi request timed out.' : 'Strapi is unavailable.')
  }
}

export function serviceHandler(service, method, implementation) {
  return async (event = {}) => {
    const incoming = event.requestContext?.http?.method || event.httpMethod
    if (incoming === 'OPTIONS') return json(204, {})
    if (incoming !== method) return json(405, { error: { message: 'Method not allowed.' } }, { allow: `${method}, OPTIONS` })
    try {
      return await implementation(event)
    } catch (error) {
      return json(error.status || 500, {
        error: { message: error.status ? error.message : 'Service request failed.' },
        service,
      })
    }
  }
}

export function startServer({ service, routes, port, envFile }) {
  if (envFile && existsSync(envFile)) process.loadEnvFile(envFile)
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost')
      if (url.pathname === '/health' && request.method === 'GET') {
        const result = json(200, { status: 'ok', service })
        response.writeHead(result.statusCode, result.headers)
        response.end(result.body)
        return
      }
      const handler = routes[url.pathname]
      if (!handler) throw httpError(404, 'Route not found.')
      const chunks = []
      let bytes = 0
      for await (const chunk of request) {
        bytes += chunk.length
        if (bytes > 1024 * 1024) throw httpError(413, 'Request body is too large.')
        chunks.push(chunk)
      }
      const result = await handler({
        httpMethod: request.method,
        path: url.pathname,
        queryStringParameters: Object.fromEntries(url.searchParams),
        headers: request.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      })
      response.writeHead(result.statusCode, result.headers)
      response.end(result.body)
    } catch (error) {
      const result = json(error.status || 500, { error: { message: error.status ? error.message : 'Service request failed.' } })
      if (!response.destroyed) {
        response.writeHead(result.statusCode, result.headers)
        response.end(result.body)
      }
    }
  })
  server.listen(process.env.PORT || process.env.SERVERLESS_PORT || port, process.env.HOST || '0.0.0.0', () => {
    console.log(`${service} listening on port ${server.address().port}`)
  })
  return server
}

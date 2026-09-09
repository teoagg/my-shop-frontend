export function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
      ...headers,
    },
    body: JSON.stringify(body),
  }
}

export function parseBody(event) {
  if (!event.body) return {}

  if (typeof event.body === 'object') return event.body

  try {
    return JSON.parse(event.body)
  } catch {
    return {}
  }
}

export function query(event) {
  return event.queryStringParameters || {}
}

export function strapiBaseUrl() {
  return process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337'
}

import { json, parseBody, strapiBaseUrl } from '../shared/response.mjs'

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return json(204, {})
  }

  const body = parseBody(event)
  const started = performance.now()
  const response = await fetch(new URL('/api/interactions/track', strapiBaseUrl()), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return json(response.status, {
      error: data?.error?.message || 'Analytics service failed.',
      service: 'analytics',
      architecture: 'serverless-microservice',
    })
  }

  return json(200, {
    ...data,
    meta: {
      ...(data?.meta || {}),
      service: 'analytics',
      architecture: 'serverless-microservice',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
}

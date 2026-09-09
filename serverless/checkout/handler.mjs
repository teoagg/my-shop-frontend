import { json, parseBody, strapiBaseUrl } from '../shared/response.mjs'

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return json(204, {})
  }

  const authorization =
    event.headers?.authorization || event.headers?.Authorization || ''

  if (!authorization) {
    return json(401, {
      error: 'Checkout service requires a JWT token.',
      service: 'checkout',
      architecture: 'serverless-microservice',
    })
  }

  const started = performance.now()
  const response = await fetch(new URL('/api/orders', strapiBaseUrl()), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization,
    },
    body: JSON.stringify(parseBody(event)),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return json(response.status, {
      error: data?.error?.message || 'Checkout service failed.',
      service: 'checkout',
      architecture: 'serverless-microservice',
    })
  }

  return json(200, {
    ...data,
    meta: {
      ...(data?.meta || {}),
      service: 'checkout',
      architecture: 'serverless-microservice',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
}

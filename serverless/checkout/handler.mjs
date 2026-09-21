import { json, parseBody, strapiBaseUrl, fetchUpstream, serviceHandler } from './runtime.mjs'

export const handler = serviceHandler('checkout', 'POST', async (event) => {
  const authorization =
    event.headers?.authorization || event.headers?.Authorization || ''

  if (!authorization) {
    return json(401, {
      error: 'Checkout service requires a JWT token.',
      service: 'checkout',
      architecture: 'strapi-proxy',
    })
  }

  const started = performance.now()
  const response = await fetchUpstream(new URL('/api/orders', strapiBaseUrl()), {
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
      architecture: 'strapi-proxy',
    })
  }

  return json(200, {
    ...data,
    meta: {
      ...(data?.meta || {}),
      service: 'checkout',
      architecture: 'strapi-proxy',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
})

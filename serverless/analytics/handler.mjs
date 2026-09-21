import { json, parseBody, strapiBaseUrl, fetchUpstream, serviceHandler } from './runtime.mjs'

export const handler = serviceHandler('analytics', 'POST', async (event) => {
  const body = parseBody(event)
  const started = performance.now()
  const response = await fetchUpstream(new URL('/api/interactions/track', strapiBaseUrl()), {
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
      architecture: 'strapi-proxy',
    })
  }

  return json(200, {
    ...data,
    meta: {
      ...(data?.meta || {}),
      service: 'analytics',
      architecture: 'strapi-proxy',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
})

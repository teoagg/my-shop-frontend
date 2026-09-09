import { json, query, strapiBaseUrl } from '../shared/response.mjs'

async function getDefaultProduct() {
  const url = new URL('/api/products', strapiBaseUrl())
  url.searchParams.set('pagination[pageSize]', '1')
  url.searchParams.set('sort', 'createdAt:desc')

  const response = await fetch(url)
  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.data?.[0]) return null

  return data.data[0]
}

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return json(204, {})
  }

  const params = query(event)
  const url = new URL('/api/recommendations', strapiBaseUrl())
  const hasExplicitProduct = Boolean(params.productId || params.documentId)

  if (!hasExplicitProduct) {
    const product = await getDefaultProduct()

    if (!product) {
      return json(404, {
        error:
          'No productId/documentId was provided and no published Strapi product was found.',
        service: 'recommendations',
        architecture: 'serverless-microservice',
        usage:
          '/recommendations?documentId=<strapi-document-id>&limit=4',
      })
    }

    url.searchParams.set('documentId', product.documentId)
  }

  for (const key of ['productId', 'documentId', 'limit', 'sessionId', 'variant']) {
    if (params[key]) url.searchParams.set(key, params[key])
  }

  const started = performance.now()
  const response = await fetch(url)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return json(response.status, {
      error: data?.error?.message || 'Recommendation service failed.',
      service: 'recommendations',
      architecture: 'serverless-microservice',
      usage: '/recommendations?documentId=<strapi-document-id>&limit=4',
    })
  }

  return json(200, {
    ...data,
    meta: {
      ...(data?.meta || {}),
      service: 'recommendations',
      architecture: 'serverless-microservice',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
}

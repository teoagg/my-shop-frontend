import { loadAnalytics } from './analytics.mjs'
import { fetchUpstream, strapiBaseUrl } from './runtime.mjs'

// A bounded, uncached snapshot for the thesis pilot; fail instead of silently truncating.
async function collection(path, params, token, signal) {
  const rows = []
  for (let page = 1; page <= 100; page++) {
    const url = new URL(path, strapiBaseUrl())
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('pagination[pageSize]', '100')
    url.searchParams.set('sort', 'id:asc')
    const response = await fetchUpstream(url, { signal, headers: { authorization: `Bearer ${token}` } })
    const body = await response.json()
    if (!response.ok) throw Object.assign(new Error('Strapi data access failed. Check the read endpoint and API token permissions.'), { status: 502 })
    const pages = body?.meta?.pagination?.pageCount
    if (!Array.isArray(body?.data) || !Number.isInteger(pages) || pages < 0) throw Object.assign(new Error('Unexpected Strapi collection response.'), { status: 502 })
    rows.push(...body.data)
    if (page >= pages) return rows
  }
  throw Object.assign(new Error('Dataset exceeds the pilot snapshot limit.'), { status: 503 })
}

export async function loadData() {
  const token = process.env.STRAPI_API_TOKEN
  if (!token) throw Object.assign(new Error('STRAPI_API_TOKEN is not configured.'), { status: 503 })
  const signal = AbortSignal.timeout(20000)
  const [products, interactions, analytics] = await Promise.all([
    collection('/api/products', { status: 'published', 'populate[0]': 'categories', 'populate[1]': 'image' }, token, signal),
    collection('/api/interactions', { 'fields[0]': 'eventType', 'fields[1]': 'sessionId', 'populate[product][fields][0]': 'documentId' }, token, signal),
    loadAnalytics(signal),
  ])
  return { products, interactions: [...interactions, ...analytics] }
}

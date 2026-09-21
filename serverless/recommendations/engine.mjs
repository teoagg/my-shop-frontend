const WEIGHTS = { purchase: 5, add_to_cart: 3, recommendation_click: 2, view: 1, recommendation_impression: 0.25 }
const RELATED = new Set(['purchase', 'add_to_cart', 'recommendation_click', 'view'])
const key = (item) => item?.documentId || String(item?.id || '')
export function recommend(products, interactions, params = {}) {
  const n = Number(params.limit)
  const limit = Number.isInteger(n) ? Math.min(Math.max(n, 1), 8) : 4
  const newest = [...products].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')) || key(a).localeCompare(key(b)))
  const target = params.documentId ? products.find(p => p.documentId === params.documentId.trim())
    : (params.productId || params.id) ? products.find(p => p.id === Number(params.productId || params.id)) : newest[0]
  if (!target) throw Object.assign(new Error('Product was not found.'), { status: 404 })
  const sessions = new Set(interactions.filter(i => key(i.product) === key(target) && RELATED.has(i.eventType)).map(i => i.sessionId).filter(Boolean))
  const eligible = newest.filter(p => key(p) !== key(target) && p.inStock === true)
  function ranked(events) {
    const scores = new Map()
    for (const event of events) {
      const id = key(event.product), weight = WEIGHTS[event.eventType] || 0
      if (id && weight) scores.set(id, (scores.get(id) || 0) + weight)
    }
    return eligible.filter(p => scores.has(key(p))).sort((a, b) => scores.get(key(b)) - scores.get(key(a)) || key(a).localeCompare(key(b)))
  }
  const categories = new Set((target.categories || []).map(key))
  const stages = [
    ['collaborative', ranked(interactions.filter(i => sessions.has(i.sessionId)))],
    ['category', eligible.filter(p => (p.categories || []).some(c => categories.has(key(c))))],
    ['popular', ranked(interactions)],
    ['latest', eligible],
  ]
  const data = [], seen = new Set()
  for (const [reason, candidates] of stages) for (const product of candidates) {
    if (data.length >= limit) break
    if (seen.has(key(product))) continue
    seen.add(key(product))
    data.push({ ...product, recommendationReason: reason })
  }
  return data
}

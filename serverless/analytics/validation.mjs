import { randomUUID, createHash } from 'node:crypto'
const types = new Set(['view','add_to_cart','purchase','recommendation_impression','recommendation_click'])
const bad = message => Object.assign(new Error(message), { status: 400 })
export function normalize(body) {
  const input = body.data ?? body
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw bad('Invalid event.')
  if (!types.has(input.eventType)) throw bad('Invalid interaction event type.')
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim() : ''
  if (sessionId.length < 8 || sessionId.length > 120) throw bad('Invalid session id.')
  const documentId = typeof input.documentId === 'string' ? input.documentId.trim() : ''
  const productId = Number(input.productId)
  if (documentId ? !/^[a-zA-Z0-9_-]{1,100}$/.test(documentId) : !Number.isInteger(productId) || productId < 1) throw bad('Invalid product identity.')
  const eventId = input.eventId ?? randomUUID()
  if (typeof eventId !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(eventId)) throw bad('Invalid event id.')
  if (input.variant !== undefined && !['A','B'].includes(input.variant)) throw bad('Invalid variant.')
  const metadata = input.metadata ?? null
  if (metadata !== null && (typeof metadata !== 'object' || Array.isArray(metadata))) throw bad('Invalid metadata.')
  if (Buffer.byteLength(JSON.stringify(metadata)) > 4096) throw bad('Metadata is too large.')
  return { eventId, eventType: input.eventType, sessionId, variant: input.variant || 'A', documentId, productId: Number.isInteger(productId) ? productId : null, source: typeof input.source === 'string' ? input.source.slice(0,80) : null, metadata }
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k,canonical(value[k])]))
  return value
}
export function fingerprint(record) {
  const stable = {...record}
  delete stable.createdAt
  return createHash('sha256').update(JSON.stringify(canonical(stable))).digest('hex')
}
export function summarize(events) {
  return ['A','B'].map(variant => {
    const rows = events.filter(e => e.variant === variant)
    const count = name => rows.filter(e => e.eventType === name).length
    const sessions = new Set(rows.map(e => e.sessionId)).size
    const views=count('view'), addToCart=count('add_to_cart'), purchases=count('purchase'), recommendationImpressions=count('recommendation_impression'), recommendationClicks=count('recommendation_click')
    return { variant, sessions, views, addToCart, purchases, recommendationImpressions, recommendationClicks, addToCartRate:sessions?addToCart/sessions:0, conversionRate:sessions?purchases/sessions:0, recommendationCtr:recommendationImpressions?recommendationClicks/recommendationImpressions:0 }
  })
}

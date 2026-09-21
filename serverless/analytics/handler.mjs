import { json, parseBody, strapiBaseUrl, fetchUpstream, serviceHandler } from './runtime.mjs'
import { normalize, summarize } from './validation.mjs'
import { save, readPage, allEvents } from './store.mjs'

export async function findProduct(input) {
  const url = new URL('/api/products', strapiBaseUrl())
  url.searchParams.set('status','published')
  url.searchParams.set(input.documentId ? 'filters[documentId][$eq]' : 'filters[id][$eq]', input.documentId || String(input.productId))
  url.searchParams.set('fields[0]','documentId')
  url.searchParams.set('pagination[pageSize]','1')
  const response = await fetchUpstream(url)
  const body = await response.json()
  if (!response.ok) throw Object.assign(new Error('Product lookup failed.'),{status:502})
  const product=body?.data?.[0]
  if (!product?.id || !product.documentId) throw Object.assign(new Error('Published product was not found.'),{status:400})
  return {id:product.id,documentId:product.documentId}
}
export function makeHandler({ persist=save, lookup=findProduct } = {}) {
  return serviceHandler('analytics','POST',async event => {
    if (Buffer.byteLength(typeof event.body === 'string' ? event.body : JSON.stringify(event.body || {})) > 16384) return json(413,{error:{message:'Event body is too large.'}})
    const input=normalize(parseBody(event))
    const product=await lookup(input)
    const fields={...input}
    delete fields.documentId
    delete fields.productId
    const record={...fields,product,createdAt:new Date().toISOString()}
    const duplicate=await persist(record)
    return json(200,{data:{eventId:record.eventId,accepted:true,duplicate},meta:{service:'analytics',storage:'dynamodb'}})
  })
}
export const handler=makeHandler()
// Separate function with no API Gateway event; callers require lambda:InvokeFunction via IAM.
export async function reader(event={}) {
  if (event.requestContext || event.httpMethod) throw new Error('Reader is only available through authenticated Lambda invocation.')
  return readPage(event.cursor)
}
export const summary=serviceHandler('analytics-summary','GET',async () => json(200,{data:summarize(await allEvents()),meta:{source:'dynamodb',scope:'events collected after analytics migration'}}))

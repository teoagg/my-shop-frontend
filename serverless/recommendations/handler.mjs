import { json, query, serviceHandler } from './runtime.mjs'
import { loadData } from './data.mjs'
import { recommend } from './engine.mjs'

export const handler = serviceHandler('recommendations', 'GET', async (event) => {
  const started = performance.now()
  const { products, interactions } = await loadData()
  return json(200, {
    data: recommend(products, interactions, query(event)),
    meta: {
      algorithm: 'item-session collaborative filtering with category/popularity fallback',
      implementation: 'independent-recommendations-v1',
      service: 'recommendations',
      runtimeMs: Math.round(performance.now() - started),
    },
  })
})

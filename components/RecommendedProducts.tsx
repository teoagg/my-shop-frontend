import RecommendationPanel from '@/components/RecommendationPanel'
import { fetchStrapi } from '@/lib/strapi'
import { getRecommendationsUrl } from '@/lib/service-endpoints'
import type { Product } from '@/lib/types'

type Recommendation = Product & {
  recommendationReason?: string
}

type RecommendationResponse = {
  data: Recommendation[]
}

type Props = {
  productId: number
  documentId?: string
}

async function getRecommendations(productId: number, documentId?: string) {
  try {
    const serverlessUrl = process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL

    if (serverlessUrl) {
      const url = new URL(getRecommendationsUrl())
      url.searchParams.set('productId', String(productId))
      url.searchParams.set('limit', '4')
      if (documentId) url.searchParams.set('documentId', documentId)

      const response = await fetch(url, {
        cache: 'no-store',
      })

      if (!response.ok) return []

      const data = (await response.json()) as RecommendationResponse
      return data.data
    }

    const response = await fetchStrapi<RecommendationResponse>(
      '/api/recommendations',
      {
        productId,
        documentId,
        limit: 4,
      }
    )

    return response.data
  } catch {
    return []
  }
}

export default async function RecommendedProducts({ productId, documentId }: Props) {
  const products = await getRecommendations(productId, documentId)

  if (!products.length) return null

  return (
    <RecommendationPanel
      productId={productId}
      products={products}
    />
  )
}

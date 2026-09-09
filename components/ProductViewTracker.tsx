'use client'

import { useEffect } from 'react'
import { trackInteraction } from '@/lib/analytics'

type Props = {
  productId: number
  documentId?: string
}

export default function ProductViewTracker({ productId, documentId }: Props) {
  useEffect(() => {
    trackInteraction({
      eventType: 'view',
      productId,
      documentId,
      source: 'product_page',
    })
  }, [documentId, productId])

  return null
}

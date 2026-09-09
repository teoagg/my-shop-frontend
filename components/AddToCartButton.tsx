'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/cart'
import { trackInteraction } from '@/lib/analytics'

type Props = {
  id: number
  documentId?: string
  slug: string
  title: string
  price: number
  image?: string | null
  inStock?: boolean
  compact?: boolean
  source?: string
}

export default function AddToCartButton({
  compact = false,
  inStock = true,
  ...props
}: Props) {
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    if (!inStock) return

    addToCart({
      id: props.id,
      documentId: props.documentId,
      slug: props.slug,
      title: props.title,
      price: props.price,
      quantity: 1,
      image: props.image || null,
    })

    trackInteraction({
      eventType: 'add_to_cart',
      productId: props.id,
      documentId: props.documentId,
      source: props.source || 'product',
    })

    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!inStock}
      className={`${compact ? 'w-full' : ''} ${
        inStock ? 'btn-primary' : 'btn-secondary cursor-not-allowed opacity-60'
      }`}
    >
      {!inStock ? 'Εκτός αποθέματος' : added ? 'Προστέθηκε' : 'Προσθήκη στο καλάθι'}
    </button>
  )
}

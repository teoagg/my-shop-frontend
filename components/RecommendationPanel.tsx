'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { getAbVariant, type AbVariant } from '@/lib/ab-testing'
import { trackInteraction } from '@/lib/analytics'
import { formatCurrency } from '@/lib/format'
import { getStrapiMedia } from '@/lib/strapi'
import type { Product } from '@/lib/types'

type Recommendation = Product & {
  recommendationReason?: string
}

type Props = {
  productId: number
  products: Recommendation[]
}

const reasonLabel: Record<string, string> = {
  collaborative: 'Βάσει παρόμοιων sessions',
  category: 'Ίδια κατηγορία',
  popular: 'Δημοφιλές',
  latest: 'Νέο προϊόν',
}

export default function RecommendationPanel({ productId, products }: Props) {
  const [variant, setVariant] = useState<AbVariant>('A')

  useEffect(() => {
    const currentVariant = getAbVariant()

    window.setTimeout(() => setVariant(currentVariant), 0)

    for (const product of products) {
      trackInteraction({
        eventType: 'recommendation_impression',
        productId: product.id,
        documentId: product.documentId,
        source: `recommendations_variant_${currentVariant}`,
        metadata: {
          targetProductId: productId,
          reason: product.recommendationReason,
        },
      })
    }
  }, [productId, products])

  const visibleProducts = variant === 'A' ? products.slice(0, 3) : products

  const title = useMemo(
    () =>
      variant === 'A'
        ? 'Προτεινόμενα προϊόντα'
        : 'Άλλοι χρήστες είδαν επίσης',
    [variant]
  )

  return (
    <section
      className={`mt-8 rounded-[8px] border border-[var(--line)] bg-white p-5 ${
        variant === 'B' ? 'shadow-sm ring-2 ring-[rgba(23,107,91,0.12)]' : ''
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--accent)]">
            AI recommender · Variant {variant}
          </p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Collaborative filtering με fallback σε κατηγορία/δημοτικότητα.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => {
          const imageUrl = getStrapiMedia(product.image?.url)
          const price = Number(product.price)

          return (
            <article
              key={product.id}
              className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-[#fbfbf8]"
            >
              <Link
                href={`/products/${product.slug}`}
                onClick={() =>
                  trackInteraction({
                    eventType: 'recommendation_click',
                    productId: product.id,
                    documentId: product.documentId,
                    source: `recommendations_variant_${variant}`,
                    metadata: {
                      targetProductId: productId,
                      reason: product.recommendationReason,
                    },
                  })
                }
                className="block"
              >
                <div className="relative aspect-[4/3] bg-[#eceee5]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.image?.alternativeText || product.title}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm font-bold text-[var(--muted)]">
                      Χωρίς εικόνα
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-[var(--accent)]">
                    {reasonLabel[product.recommendationReason || ''] || 'Πρόταση'}
                  </p>
                  <h3 className="mt-2 font-black leading-snug">{product.title}</h3>
                  <p className="mt-2 font-black">{formatCurrency(price)}</p>
                </div>
              </Link>
              <div className="border-t border-[var(--line)] p-4">
                <AddToCartButton
                  id={product.id}
                  documentId={product.documentId}
                  slug={product.slug}
                  title={product.title}
                  price={price}
                  image={imageUrl}
                  inStock={product.inStock}
                  compact
                  source={`recommendations_variant_${variant}`}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

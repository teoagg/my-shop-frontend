import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/lib/types'
import { getStrapiMedia } from '@/lib/strapi'

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = getStrapiMedia(product.image?.url)
  const price = Number(product.price)
  const categoryName =
    product.category?.name || product.categories?.[0]?.name || 'Χωρίς κατηγορία'

  return (
    <article className="group overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eceee5]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.image?.alternativeText || product.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm font-bold text-[var(--muted)]">
              Χωρίς εικόνα
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--accent)]">
            {categoryName}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-black leading-snug">{product.title}</h2>
            <span className="whitespace-nowrap text-base font-black">
              {formatCurrency(price)}
            </span>
          </div>

          <p
            className={`mt-3 text-sm font-bold ${
              product.inStock ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
            }`}
          >
            {product.inStock
              ? `Διαθέσιμο${product.stockCount ? ` (${product.stockCount})` : ''}`
              : 'Μη διαθέσιμο'}
          </p>
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
        />
      </div>
    </article>
  )
}

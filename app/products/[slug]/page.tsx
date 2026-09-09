import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import ProductDescription from '@/components/ProductDescription'
import ProductViewTracker from '@/components/ProductViewTracker'
import RecommendedProducts from '@/components/RecommendedProducts'
import { formatCurrency } from '@/lib/format'
import { getProductBySlug, getStrapiMedia } from '@/lib/strapi'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const response = await getProductBySlug(slug)
  const product = response.data[0]

  if (!product) notFound()

  const imageUrl = getStrapiMedia(product.image?.url)
  const price = Number(product.price)
  const categoryName =
    product.category?.name || product.categories?.[0]?.name || 'Χωρίς κατηγορία'

  return (
    <main className="shell py-10">
      <ProductViewTracker productId={product.id} documentId={product.documentId} />
      <Link href="/products" className="mb-6 inline-flex text-sm font-bold text-[var(--accent)]">
        Επιστροφή στα προϊόντα
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white">
          <div className="relative aspect-square bg-[#eceee5]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.image?.alternativeText || product.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center font-bold text-[var(--muted)]">
                Χωρίς εικόνα προϊόντος
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--line)] bg-white p-6">
          <p className="text-sm font-bold uppercase text-[var(--accent)]">
            {categoryName}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight">
            {product.title}
          </h1>
          <p className="mt-5 text-3xl font-black">{formatCurrency(price)}</p>

          <div className="mt-5 grid gap-3 rounded-[8px] bg-[#f5f5ef] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Διαθεσιμότητα
              </p>
              <p
                className={`mt-1 font-black ${
                  product.inStock ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                }`}
              >
                {product.inStock ? 'Σε απόθεμα' : 'Εκτός αποθέματος'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Τεμάχια
              </p>
              <p className="mt-1 font-black">{product.stockCount || 0}</p>
            </div>
          </div>

          <div className="mt-6">
            <AddToCartButton
              id={product.id}
              documentId={product.documentId}
              slug={product.slug}
              title={product.title}
              price={price}
              image={imageUrl}
              inStock={product.inStock}
            />
          </div>

          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <h2 className="mb-3 text-xl font-black">Περιγραφή</h2>
            <ProductDescription description={product.description} />
          </div>
        </div>
      </section>

      <RecommendedProducts productId={product.id} documentId={product.documentId} />
    </main>
  )
}

'use client'

import { useMemo, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'stock'

export default function ProductGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('featured')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('el-GR')

    const filtered = products.filter((product) => {
      const categoryName =
        product.category?.name || product.categories?.[0]?.name || ''
      const matchesQuery =
        !normalizedQuery ||
        product.title.toLocaleLowerCase('el-GR').includes(normalizedQuery) ||
        categoryName.toLocaleLowerCase('el-GR').includes(normalizedQuery)

      return matchesQuery && (!onlyAvailable || product.inStock)
    })

    return filtered.toSorted((a, b) => {
      if (sortMode === 'price-asc') return Number(a.price) - Number(b.price)
      if (sortMode === 'price-desc') return Number(b.price) - Number(a.price)
      if (sortMode === 'stock') return Number(b.stockCount) - Number(a.stockCount)
      return 0
    })
  }, [onlyAvailable, products, query, sortMode])

  return (
    <section>
      <div className="mb-6 grid gap-3 rounded-[8px] border border-[var(--line)] bg-white p-4 md:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-[var(--muted)]">
            Αναζήτηση
          </span>
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Προϊόν ή κατηγορία"
            type="search"
          />
        </label>

        <label className="block min-w-48">
          <span className="mb-1 block text-xs font-bold uppercase text-[var(--muted)]">
            Ταξινόμηση
          </span>
          <select
            className="field"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <option value="featured">Προτεινόμενα</option>
            <option value="price-asc">Τιμή: αύξουσα</option>
            <option value="price-desc">Τιμή: φθίνουσα</option>
            <option value="stock">Απόθεμα</option>
          </select>
        </label>

        <label className="flex min-h-12 items-end gap-2 pb-3 text-sm font-semibold">
          <input
            checked={onlyAvailable}
            onChange={(event) => setOnlyAvailable(event.target.checked)}
            type="checkbox"
          />
          Μόνο διαθέσιμα
        </label>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8 text-center">
          <h2 className="text-xl font-bold">Δεν βρέθηκαν προϊόντα</h2>
          <p className="mt-2 text-[var(--muted)]">
            Δοκίμασε διαφορετικό όρο αναζήτησης ή απενεργοποίησε το φίλτρο διαθεσιμότητας.
          </p>
        </div>
      )}
    </section>
  )
}

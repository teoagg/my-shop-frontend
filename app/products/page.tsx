import { connection } from 'next/server'
import ProductGrid from '@/components/ProductGrid'
import { getProducts } from '@/lib/strapi'

export default async function ProductsPage() {
  await connection()

  const data = await getProducts()
  const availableCount = data.data.filter((product) => product.inStock).length

  return (
    <main className="shell py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-[var(--accent)]">
            Κατάλογος
          </p>
          <h1 className="mt-2 text-4xl font-black">Προϊόντα</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Αναζήτηση, φίλτρα και ταξινόμηση για γρήγορη σύγκριση προϊόντων,
            όπως απαιτείται από μια σύγχρονη headless e-commerce διεπαφή.
          </p>
        </div>
        <div className="rounded-[8px] border border-[var(--line)] bg-white px-4 py-3 text-sm">
          <strong>{availableCount}</strong> διαθέσιμα από <strong>{data.data.length}</strong>
        </div>
      </div>

      <ProductGrid products={data.data} />
    </main>
  )
}

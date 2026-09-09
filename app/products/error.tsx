'use client'

import Link from 'next/link'

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="shell py-12">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
        <p className="text-sm font-bold uppercase text-[var(--danger)]">
          Σφάλμα σύνδεσης CMS
        </p>
        <h1 className="mt-3 text-3xl font-black">
          Δεν φορτώθηκαν τα προϊόντα
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Έλεγξε ότι το Strapi backend τρέχει στο URL του `.env.local` και ότι
          τα public permissions για τα προϊόντα είναι ενεργά.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Δοκιμή ξανά
          </button>
          <Link href="/" className="btn-secondary">
            Αρχική
          </Link>
        </div>
      </div>
    </main>
  )
}

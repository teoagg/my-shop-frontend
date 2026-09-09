import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <main className="shell py-12">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">
          Πληρωμή
        </p>
        <h1 className="mt-3 text-3xl font-black">Η πληρωμή ολοκληρώνεται στο checkout</h1>
        <p className="mt-3 text-[var(--muted)]">
          Η τρέχουσα ροή δεν χρησιμοποιεί redirect. Η κάρτα συμπληρώνεται μέσα
          στη σελίδα checkout και το Strapi αποθηκεύει την paid παραγγελία.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/checkout" className="btn-primary">
            Επιστροφή στο checkout
          </Link>
          <Link href="/orders" className="btn-secondary">
            Προβολή παραγγελιών
          </Link>
        </div>
      </div>
    </main>
  )
}

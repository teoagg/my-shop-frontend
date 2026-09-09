import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <main className="shell py-12">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">
          Stripe test mode
        </p>
        <h1 className="mt-3 text-3xl font-black">Η πληρωμή ακυρώθηκε</h1>
        <p className="mt-3 text-[var(--muted)]">
          Δεν δημιουργήθηκε παραγγελία. Το καλάθι παραμένει διαθέσιμο για νέα προσπάθεια.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/checkout" className="btn-primary">
            Επιστροφή στο checkout
          </Link>
          <Link href="/products" className="btn-secondary">
            Συνέχεια αγορών
          </Link>
        </div>
      </div>
    </main>
  )
}

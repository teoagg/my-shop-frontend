import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="shell py-16">
      <div className="max-w-2xl rounded-[8px] border border-[var(--line)] bg-white p-8">
        <p className="text-sm font-bold text-[var(--accent)]">PWA offline</p>
        <h1 className="mt-3 text-3xl font-black">Δεν υπάρχει σύνδεση</h1>
        <p className="mt-4 text-[var(--muted)]">
          Η εφαρμογή λειτουργεί ως PWA και κρατά βασικές σελίδες στην cache.
          Συνδέσου ξανά στο διαδίκτυο για ενημερωμένα προϊόντα και παραγγελίες.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Επιστροφή στην αρχική
        </Link>
      </div>
    </main>
  )
}

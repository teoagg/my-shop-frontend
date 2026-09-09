import Link from 'next/link'
import { redirect } from 'next/navigation'

const metrics = [
  ['Headless CMS', 'Strapi 5 REST API'],
  ['Frontend', 'Next.js 16 PWA'],
  ['Αξιολόγηση', 'Performance, UX, security'],
]

export default function HomePage() {
  if (process.env.SITE_MODE === 'medical') redirect('/el')
  return (
    <main>
      <section className="shell grid min-h-[calc(100vh-4rem)] items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold text-[var(--accent)]">
            Διπλωματική εφαρμογή ηλεκτρονικού εμπορίου
          </p>
          <h1 className="section-title">
            Strapi Headless E-Commerce
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Μια επεκτάσιμη πλατφόρμα ηλεκτρονικού καταστήματος με Strapi,
            Next.js App Router, λειτουργίες PWA και ροή παραγγελίας για
            αξιολόγηση απόδοσης, ασφάλειας και εμπειρίας χρήστη.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Προβολή προϊόντων
            </Link>
            <Link href="/cart" className="btn-secondary">
              Άνοιγμα καλαθιού
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-[0_24px_60px_rgba(32,34,28,0.10)]">
          <div className="aspect-[4/3] rounded-[8px] bg-[linear-gradient(135deg,#176b5b,#f1c27d)] p-6 text-white">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide opacity-85">
                  Composable commerce
                </p>
                <p className="mt-4 max-w-sm text-3xl font-black leading-tight">
                  CMS περιεχόμενο, γρήγορη διεπαφή, offline-ready εμπειρία.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {metrics.map(([label, value]) => (
                  <div key={label} className="rounded-[8px] bg-white/16 p-3 backdrop-blur">
                    <p className="text-xs opacity-80">{label}</p>
                    <p className="mt-1 text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { contact, content, isLocale } from '@/lib/medicalContent'

export default async function MedicalHomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params

  if (!isLocale(lang)) notFound()

  const t = content[lang]

  return (
    <main>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <Image
          src="/santorini-medical-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,250,247,0.96)_0%,rgba(250,250,247,0.84)_42%,rgba(250,250,247,0.22)_72%)]" />
        <div className="shell relative grid min-h-[calc(100vh-4rem)] items-center py-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[var(--line)] bg-white/86 px-4 py-2 text-sm font-bold text-[var(--accent)] shadow-sm">
              {t.emergency}
            </p>
            <h1 className="section-title">{t.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {t.heroCopy}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={contact.phoneHref} className="btn-primary">
                {t.primaryCta}
              </a>
              <a href={contact.appointmentHref} className="btn-secondary">
                {t.secondaryCta}
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {t.proof.map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/70 bg-white/78 p-4 shadow-sm backdrop-blur">
                  <p className="text-3xl font-black text-[var(--accent-dark)]">{value}</p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-[var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white py-16">
        <div className="shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <p className="text-sm font-black uppercase text-[var(--accent)]">{t.introEyebrow}</p>
          <div>
            <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">{t.introTitle}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{t.introCopy}</p>
          </div>
        </div>
      </section>

      <section id="services" className="py-16">
        <div className="shell">
          <h2 className="text-3xl font-black md:text-4xl">{t.servicesTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {t.services.map((service) => (
              <article key={service.title} className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black">{service.title}</h3>
                <p className="mt-4 leading-7 text-[var(--muted)]">{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="locations" className="bg-[var(--surface-alt)] py-16">
        <div className="shell">
          <h2 className="text-3xl font-black md:text-4xl">{t.locationsTitle}</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {t.locations.map((location) => (
              <article key={location.title} className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="mb-5 h-2 w-20 rounded-full bg-[var(--accent)]" />
                <h3 className="text-2xl font-black">{location.title}</h3>
                <p className="mt-4 leading-7 text-[var(--muted)]">{location.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tourists" className="py-16">
        <div className="shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">{t.touristsTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">{t.touristsCopy}</p>
          </div>
          <ul className="grid gap-3">
            {t.touristBullets.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg border border-[var(--line)] bg-white p-4 font-bold shadow-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--sky)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="border-t border-[var(--line)] bg-[var(--foreground)] py-16 text-white">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">{t.contactTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/76">{t.contactCopy}</p>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/8 p-6">
            <a href={contact.phoneHref} className="block text-3xl font-black text-white">
              {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="mt-4 block text-lg font-bold text-white/82">
              {contact.email}
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={contact.whatsappHref} className="btn-primary">
                WhatsApp
              </a>
              <a href={contact.appointmentHref} className="btn-secondary border-white/18 bg-white/10 text-white hover:border-white/45">
                {t.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--foreground)] pb-8 text-white/62">
        <div className="shell border-t border-white/12 pt-6 text-sm">{t.footer}</div>
      </footer>
    </main>
  )
}

import Link from 'next/link'
import type { Locale } from '@/lib/medicalContent'

type HeaderProps = {
  lang: Locale
}

const nav = {
  el: [
    ['Υπηρεσίες', '#services'],
    ['Τοποθεσίες', '#locations'],
    ['Για τουρίστες', '#tourists'],
    ['Επικοινωνία', '#contact'],
  ],
  en: [
    ['Services', '#services'],
    ['Locations', '#locations'],
    ['For visitors', '#tourists'],
    ['Contact', '#contact'],
  ],
} satisfies Record<Locale, [string, string][]>

const homeLabel = {
  el: 'Παθολόγος | Αθήνα & Σαντορίνη',
  en: 'Internal Medicine | Athens & Santorini',
}

export default function Header({ lang }: HeaderProps) {
  const otherLang = lang === 'el' ? 'en' : 'el'

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(250,250,247,0.92)] backdrop-blur">
      <nav className="shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <Link href={`/${lang}`} className="flex items-center gap-3 font-black tracking-wide">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--foreground)] text-white">
            MD
          </span>
          <span>{homeLabel[lang]}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {nav[lang].map(([label, href]) => (
            <Link key={href} className="rounded-lg px-3 py-2 hover:bg-white" href={`/${lang}${href}`}>
              {label}
            </Link>
          ))}
          <Link
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 uppercase hover:border-[var(--accent)]"
            href={`/${otherLang}`}
            hrefLang={otherLang}
          >
            {otherLang}
          </Link>
        </div>
      </nav>
    </header>
  )
}

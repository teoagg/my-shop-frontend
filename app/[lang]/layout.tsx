import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import HtmlLangSetter from '@/components/HtmlLangSetter'
import { content, isLocale, locales } from '@/lib/medicalContent'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params

  if (!isLocale(lang)) notFound()

  return {
    title: content[lang].metadata.title,
    description: content[lang].metadata.description,
    alternates: {
      languages: {
        el: '/el',
        en: '/en',
      },
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params

  if (!isLocale(lang)) notFound()

  return (
    <>
      <HtmlLangSetter lang={lang} />
      <Header lang={lang} />
      {children}
    </>
  )
}

'use client'

import { useEffect } from 'react'
import type { Locale } from '@/lib/medicalContent'

export default function HtmlLangSetter({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return null
}

import type { Metadata } from 'next'
import RegisterSW from '@/components/RegisterSW'
import ShopHeader from '@/components/ShopHeader'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: process.env.SITE_MODE === 'medical' ? 'Doctor in Santorini & Athens' : 'Strapi Shop',
    template: '%s',
  },
  description: process.env.SITE_MODE === 'medical'
    ? 'Bilingual internal medicine care in Santorini and Athens.'
    : 'Ηλεκτρονικό κατάστημα προϊόντων τεχνολογίας.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body className={process.env.SITE_MODE === 'medical' ? undefined : 'shop-site'}>
        {process.env.SITE_MODE !== 'medical' && <RegisterSW />}
        {process.env.SITE_MODE !== 'medical' && <ShopHeader />}
        {children}
      </body>
    </html>
  )
}

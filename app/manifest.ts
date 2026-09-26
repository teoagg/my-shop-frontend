import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Strapi Shop',
    short_name: 'Strapi Shop',
    description:
      'Headless e-commerce storefront with Strapi, Next.js and embedded checkout.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#176b5b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}

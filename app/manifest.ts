import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Doctor in Santorini & Athens',
    short_name: 'Santorini Doctor',
    description: 'Bilingual internal medicine care in Santorini and Athens.',
    start_url: '/el',
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

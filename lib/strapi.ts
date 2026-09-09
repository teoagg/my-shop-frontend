import qs from 'qs'
import type { Product } from './types'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!

export function getStrapiMedia(url?: string | null) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

export async function fetchStrapi<T>(
  path: string,
  query?: Record<string, unknown>,
  options: RequestInit = {}
): Promise<T> {
  const queryString = query
    ? qs.stringify(query, { encodeValuesOnly: true })
    : ''

  const url = `${STRAPI_URL}${path}${queryString ? `?${queryString}` : ''}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    let details = ''
    try {
      const err = await res.json()
      details = err?.error?.message
        ? ` - ${err.error.message}`
        : ` - ${JSON.stringify(err)}`
    } catch {
      details = ''
    }

    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText}${details}`
    )
  }

  return res.json()
}

type StrapiListResponse<T> = {
  data: T[]
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export async function getProducts() {
  return fetchStrapi<StrapiListResponse<Product>>('/api/products', {
    populate: '*',
    sort: ['createdAt:desc'],
    pagination: {
      page: 1,
      pageSize: 24,
    },
  })
}

export async function getProductBySlug(slug: string) {
  return fetchStrapi<StrapiListResponse<Product>>('/api/products', {
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: '*',
  })
}
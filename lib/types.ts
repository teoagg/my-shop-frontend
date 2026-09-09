export type StrapiImageFormat = {
  url: string
}

export type StrapiMedia = {
  id: number
  url: string
  alternativeText?: string | null
}

export type Category = {
  id: number
  name: string
  slug: string
  description?: string
  products?: Product[]
}

export type Product = {
  id: number
  documentId?: string
  title: string
  slug: string
  description?: unknown
  price: number | string
  inStock: boolean
  stockCount: number
  image?: StrapiMedia | null
  gallery?: StrapiMedia[]
  category?: Category | null
  categories?: Category[]
}

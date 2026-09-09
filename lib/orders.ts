const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!

export async function getMyOrders(token: string) {
  const res = await fetch(`${STRAPI_URL}/api/orders/my`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to fetch orders')
  }

  return data
}

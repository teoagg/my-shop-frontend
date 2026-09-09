'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/format'

type OrderItem = {
  id?: number
  title?: string
  quantity: number
  price: number | string
}

type Order = {
  id: number
  items: OrderItem[]
  total: number | string
  createdAt?: string
  status?: 'pending' | 'paid' | 'cancelled'
}

type OrdersResponse = {
  data?: Order[]
  error?: {
    message?: string
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Κάτι πήγε λάθος'
}

function getStatusLabel(status: Order['status']) {
  if (status === 'paid') return 'Πληρωμένη'
  if (status === 'cancelled') return 'Ακυρωμένη'
  return 'Σε αναμονή'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const token = getToken()

        if (!token) {
          setError('Πρέπει να κάνεις σύνδεση για να δεις τις παραγγελίες σου.')
          setLoading(false)
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/my`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          }
        )

        const data = (await res.json()) as OrdersResponse

        if (!res.ok) {
          throw new Error(data.error?.message || 'Failed to fetch orders')
        }

        setOrders(data.data || [])
      } catch (err: unknown) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
          <h1 className="text-3xl font-black">Οι παραγγελίες μου</h1>
          <p className="mt-3 text-[var(--muted)]">Φόρτωση...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
          <h1 className="text-3xl font-black">Οι παραγγελίες μου</h1>
          <p className="mt-3 text-[var(--danger)]">{error}</p>
          <Link href="/login" className="btn-primary mt-6">
            Σύνδεση
          </Link>
        </div>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
          <h1 className="text-3xl font-black">Οι παραγγελίες μου</h1>
          <p className="mt-3 text-[var(--muted)]">
            Δεν υπάρχουν παραγγελίες ακόμα.
          </p>
          <Link href="/products" className="btn-primary mt-6">
            Δες προϊόντα
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">Ιστορικό</p>
        <h1 className="mt-2 text-4xl font-black">Οι παραγγελίες μου</h1>
      </div>

      <div className="space-y-5">
        {orders.map((order) => {
          const status = order.status || 'pending'

          return (
            <article
              key={order.id}
              className="rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">Παραγγελία #{order.id}</h2>
                  {order.createdAt && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {formatDate(order.createdAt)}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </span>
                  <p className="mt-2 text-xl font-black">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.map((item, index) => (
                  <div
                    key={`${order.id}-${item.id || index}`}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span>
                      {item.title || 'Προϊόν'} x {item.quantity}
                    </span>
                    <span className="font-bold">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

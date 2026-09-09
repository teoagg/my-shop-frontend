'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'
import {
  clearCart,
  getCartSnapshot,
  getServerCartSnapshot,
  removeFromCart,
  subscribeToCart,
  updateCartQuantity,
  type CartItem,
} from '@/lib/cart'
import { formatCurrency } from '@/lib/format'

export default function CartClient() {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  )

  function handleDecrease(item: CartItem) {
    if (item.quantity <= 1) {
      removeFromCart(item.id)
      return
    }

    updateCartQuantity(item.id, item.quantity - 1)
  }

  function handleIncrease(item: CartItem) {
    updateCartQuantity(item.id, item.quantity + 1)
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  if (items.length === 0) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8 text-center">
          <p className="text-sm font-bold uppercase text-[var(--accent)]">Καλάθι</p>
          <h1 className="mt-3 text-3xl font-black">Το καλάθι σου είναι άδειο</h1>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Πρόσθεσε προϊόντα από τον κατάλογο για να δοκιμάσεις την ολοκληρωμένη
            ροή παραγγελίας με Strapi authentication.
          </p>
          <Link href="/products" className="btn-primary mt-6">
            Συνέχεια αγορών
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">Checkout flow</p>
        <h1 className="mt-2 text-4xl font-black">Καλάθι</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[8px] border border-[var(--line)] bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
            >
              <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#eceee5]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-bold text-[var(--muted)]">
                    Image
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black">{item.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatCurrency(item.price)} / τεμάχιο
                </p>
                <p className="mt-3 font-bold">
                  Μερικό σύνολο: {formatCurrency(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center overflow-hidden rounded-[8px] border border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => handleDecrease(item)}
                    className="grid h-10 w-10 place-items-center hover:bg-[#f5f5ef]"
                    aria-label="Μείωση ποσότητας"
                  >
                    -
                  </button>
                  <span className="grid h-10 min-w-10 place-items-center border-x border-[var(--line)] font-black">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrease(item)}
                    className="grid h-10 w-10 place-items-center hover:bg-[#f5f5ef]"
                    aria-label="Αύξηση ποσότητας"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm font-bold text-[var(--danger)]"
                >
                  Αφαίρεση
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-[8px] border border-[var(--line)] bg-white p-5">
          <h2 className="text-xl font-black">Σύνοψη παραγγελίας</h2>
          <div className="mt-5 space-y-3 border-b border-[var(--line)] pb-5">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Προϊόντα</span>
              <span className="font-bold">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Σύνολο</span>
              <span className="font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link href="/checkout" className="btn-primary w-full">
              Ολοκλήρωση παραγγελίας
            </Link>
            <button type="button" onClick={clearCart} className="btn-secondary w-full">
              Καθαρισμός καλαθιού
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

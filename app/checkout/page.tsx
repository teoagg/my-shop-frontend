'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  clearCart,
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeToCart,
} from '@/lib/cart'
import { getToken } from '@/lib/auth'
import { formatCurrency } from '@/lib/format'
import { trackInteraction } from '@/lib/analytics'
import {
  getCheckoutUrl,
  getPaymentFinalizeUrl,
  getPaymentIntentUrl,
} from '@/lib/service-endpoints'
import { isStripeCheckoutEnabled } from '@/lib/payments'
import {
  loadStripeClient,
  type StripeCardElement,
  type StripeClient,
} from '@/lib/stripe-embedded'

type CheckoutSource = 'checkout' | 'stripe_embedded'

type PaymentIntentResponse = {
  clientSecret?: string
  paymentIntentId?: string
  total?: number
  error?: {
    message?: string
  }
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function CheckoutPage() {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  )
  const cardMountRef = useRef<HTMLDivElement | null>(null)
  const stripeRef = useRef<StripeClient | null>(null)
  const cardRef = useRef<StripeCardElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const stripeEnabled = isStripeCheckoutEnabled()
  const showCard = stripeEnabled && items.length > 0 && !success

  useEffect(() => {
    if (!showCard || !cardMountRef.current) return

    let cancelled = false

    async function mountCardElement() {
      try {
        if (!publishableKey || !publishableKey.startsWith('pk_test_')) {
          setError('Λείπει το NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY με τιμή pk_test_...')
          return
        }

        const stripe = await loadStripeClient(publishableKey)
        if (cancelled || !cardMountRef.current) return

        const elements = stripe.elements()
        const card = elements.create('card', {
          hidePostalCode: true,
          style: {
            base: {
              color: '#20231d',
              fontFamily: 'inherit',
              fontSize: '16px',
              '::placeholder': {
                color: '#74796f',
              },
            },
            invalid: {
              color: '#b42318',
            },
          },
        })

        card.on('ready', () => {
          if (!cancelled) setCardReady(true)
        })
        card.mount(cardMountRef.current)
        stripeRef.current = stripe
        cardRef.current = card
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Το Stripe.js δεν φορτώθηκε.')
      }
    }

    mountCardElement()

    return () => {
      cancelled = true
      cardRef.current?.destroy()
      cardRef.current = null
      stripeRef.current = null
      setCardReady(false)
    }
  }, [showCard])

  async function createDemoOrder(token: string, source: CheckoutSource) {
    const res = await fetch(getCheckoutUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          items,
          total,
          status: source === 'stripe_embedded' ? 'paid' : 'pending',
        },
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Η παραγγελία απέτυχε')
    }
  }

  function trackPurchases(source: CheckoutSource) {
    for (const item of items) {
      trackInteraction({
        eventType: 'purchase',
        productId: item.id,
        documentId: item.documentId,
        source,
        metadata: {
          quantity: item.quantity,
          orderTotal: total,
        },
      })
    }
  }

  async function handleEmbeddedStripePayment(token: string) {
    const stripe = stripeRef.current
    const card = cardRef.current

    if (!stripe || !card || !cardReady) {
      throw new Error('Το πεδίο κάρτας δεν είναι ακόμη έτοιμο.')
    }

    const intentRes = await fetch(getPaymentIntentUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          items,
        },
      }),
    })

    const intentData = (await intentRes.json().catch(() => null)) as
      | PaymentIntentResponse
      | null

    if (!intentRes.ok || !intentData?.clientSecret || !intentData.paymentIntentId) {
      throw new Error(
        intentData?.error?.message ||
          `Το Strapi δεν δημιούργησε PaymentIntent (${intentRes.status}).`
      )
    }

    const confirmation = await stripe.confirmCardPayment(intentData.clientSecret, {
      payment_method: {
        card,
      },
    })

    if (confirmation.error) {
      throw new Error(confirmation.error.message || 'Η πληρωμή απορρίφθηκε.')
    }

    if (confirmation.paymentIntent?.status !== 'succeeded') {
      throw new Error('Η πληρωμή δεν ολοκληρώθηκε.')
    }

    const finalizeRes = await fetch(getPaymentFinalizeUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          items,
          paymentIntentId: intentData.paymentIntentId,
        },
      }),
    })

    const finalizeData = await finalizeRes.json().catch(() => null)

    if (!finalizeRes.ok) {
      throw new Error(
        finalizeData?.error?.message ||
          `Η paid παραγγελία δεν αποθηκεύτηκε στο Strapi (${finalizeRes.status}).`
      )
    }
  }

  async function handleCheckout() {
    const token = getToken()

    if (!token) {
      setError('Πρέπει να συνδεθείς πριν ολοκληρώσεις την παραγγελία.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (stripeEnabled) {
        await handleEmbeddedStripePayment(token)
        clearCart()
        trackPurchases('stripe_embedded')
        setSuccess(true)
        return
      }

      await createDemoOrder(token, 'checkout')
      clearCart()
      trackPurchases('checkout')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε λάθος')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
          <p className="text-sm font-bold uppercase text-[var(--accent)]">
            Επιτυχής καταχώρηση
          </p>
          <h1 className="mt-3 text-3xl font-black">Η παραγγελία ολοκληρώθηκε</h1>
          <p className="mt-3 text-[var(--muted)]">
            Η πληρωμή επιβεβαιώθηκε και η παραγγελία αποθηκεύτηκε στο Strapi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/orders" className="btn-primary">
              Προβολή παραγγελιών
            </Link>
            <Link href="/products" className="btn-secondary">
              Συνέχεια αγορών
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="shell py-12">
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-8">
          <h1 className="text-3xl font-black">Το καλάθι είναι άδειο</h1>
          <Link href="/products" className="btn-primary mt-6">
            Πήγαινε στα προϊόντα
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="shell py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">Checkout</p>
        <h1 className="mt-2 text-4xl font-black">Ολοκλήρωση παραγγελίας</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-[8px] border border-[var(--line)] bg-white p-5">
          <h2 className="text-xl font-black">Προϊόντα</h2>
          <div className="mt-5 divide-y divide-[var(--line)]">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-4">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Ποσότητα: {item.quantity}
                  </p>
                </div>
                <p className="font-black">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-[8px] border border-[var(--line)] bg-white p-5">
          <h2 className="text-xl font-black">
            {stripeEnabled ? 'Πληρωμή μέσα στο checkout' : 'Πληρωμή demo'}
          </h2>
          {stripeEnabled ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-[var(--muted)]">
                Το Strapi δημιουργεί PaymentIntent και η κάρτα επιβεβαιώνεται
                με Stripe.js χωρίς redirect σε σελίδα Stripe.
              </p>
              <div className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] p-4">
                <div ref={cardMountRef} className="min-h-6" />
              </div>
              <p className="text-xs text-[var(--muted)]">
                Test card: 4242 4242 4242 4242, οποιαδήποτε μελλοντική λήξη και CVC.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Για τη διπλωματική, η ροή δημιουργεί παραγγελία στο Strapi χωρίς πραγματική πληρωμή.
            </p>
          )}
          <div className="mt-5 flex justify-between border-t border-[var(--line)] pt-5">
            <span className="font-bold">Σύνολο</span>
            <span className="text-xl font-black">{formatCurrency(total)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-[8px] bg-red-50 p-3 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || (stripeEnabled && !cardReady)}
            className="btn-primary mt-5 w-full disabled:opacity-60"
          >
            {loading
              ? stripeEnabled
                ? 'Επιβεβαίωση πληρωμής...'
                : 'Καταχώρηση...'
              : stripeEnabled
                ? 'Πληρωμή και καταχώρηση'
                : 'Καταχώρηση παραγγελίας'}
          </button>
          <Link href="/cart" className="btn-secondary mt-3 w-full">
            Επιστροφή στο καλάθι
          </Link>
        </aside>
      </div>
    </main>
  )
}

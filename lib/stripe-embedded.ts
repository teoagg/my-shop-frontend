export type StripeCardElement = {
  on: (event: 'ready', handler: () => void) => void
  mount: (element: HTMLElement) => void
  destroy: () => void
}

type StripeElements = {
  create: (
    type: 'card',
    options?: {
      style?: Record<string, unknown>
      hidePostalCode?: boolean
    }
  ) => StripeCardElement
}

type StripePaymentIntent = {
  id: string
  status: string
}

export type StripeClient = {
  elements: () => StripeElements
  confirmCardPayment: (
    clientSecret: string,
    options: {
      payment_method: {
        card: StripeCardElement
      }
    }
  ) => Promise<{
    error?: {
      message?: string
    }
    paymentIntent?: StripePaymentIntent
  }>
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeClient
  }
}

let stripePromise: Promise<StripeClient> | null = null

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Stripe.js can only load in the browser.'))
      return
    }

    if (window.Stripe) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.stripe.com/v3/"]'
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Stripe.js failed to load.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Stripe.js failed to load.'))
    document.head.appendChild(script)
  })
}

export function loadStripeClient(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripeScript().then(() => {
      if (!window.Stripe) {
        throw new Error('Stripe.js is not available.')
      }

      return window.Stripe(publishableKey)
    })
  }

  return stripePromise
}

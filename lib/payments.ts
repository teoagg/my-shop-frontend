const PAYMENT_PROVIDER = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER

export function isStripeCheckoutEnabled() {
  return PAYMENT_PROVIDER === 'stripe'
}

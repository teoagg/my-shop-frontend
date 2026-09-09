const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function serviceUrl(value: string | undefined, fallback: string) {
  return value && value.trim() ? trimTrailingSlash(value.trim()) : fallback
}

export function getRecommendationsUrl() {
  return serviceUrl(
    process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL,
    `${STRAPI_URL}/api/recommendations`
  )
}

export function getAnalyticsUrl() {
  return serviceUrl(
    process.env.NEXT_PUBLIC_ANALYTICS_URL,
    `${STRAPI_URL}/api/interactions/track`
  )
}

export function getCheckoutUrl() {
  return serviceUrl(
    process.env.NEXT_PUBLIC_CHECKOUT_URL,
    `${STRAPI_URL}/api/orders`
  )
}

export function getPaymentIntentUrl() {
  return `${STRAPI_URL}/api/payments/create-intent`
}

export function getPaymentFinalizeUrl() {
  return `${STRAPI_URL}/api/payments/finalize`
}

export function getServiceMode() {
  return {
    recommendations: process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL
      ? 'serverless'
      : 'strapi',
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_URL ? 'serverless' : 'strapi',
    checkout: process.env.NEXT_PUBLIC_CHECKOUT_URL ? 'serverless' : 'strapi',
  }
}

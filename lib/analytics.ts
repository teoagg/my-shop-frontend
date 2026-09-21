'use client'

import { getAbVariant, getSessionId } from '@/lib/ab-testing'
import { getAnalyticsUrl } from '@/lib/service-endpoints'

export type InteractionEvent =
  | 'view'
  | 'add_to_cart'
  | 'purchase'
  | 'recommendation_impression'
  | 'recommendation_click'

type TrackPayload = {
  eventType: InteractionEvent
  productId?: number
  documentId?: string
  source?: string
  metadata?: Record<string, unknown>
}

export function trackInteraction(payload: TrackPayload) {
  if (typeof window === 'undefined') return
  if (!payload.productId && !payload.documentId) return

  const body = JSON.stringify({
    data: {
      ...payload,
      eventId: crypto.randomUUID(),
      sessionId: getSessionId(),
      variant: getAbVariant(),
    },
  })

  const url = getAnalyticsUrl()

  // Cross-origin JSON beacons include credentials, which require credentialed CORS.
  // Analytics endpoints use anonymous requests, so use keepalive fetch across origins.
  if (navigator.sendBeacon && new URL(url, window.location.href).origin === window.location.origin) {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon(url, blob)) return
  }

  fetch(url, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {})
}

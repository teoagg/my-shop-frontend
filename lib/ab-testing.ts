'use client'

const SESSION_KEY = 'shop_session_id'
const VARIANT_KEY = 'shop_ab_variant'

export type AbVariant = 'A' | 'B'

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getSessionId() {
  if (typeof window === 'undefined') return ''

  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const created = randomId()
  localStorage.setItem(SESSION_KEY, created)
  return created
}

export function getAbVariant(): AbVariant {
  if (typeof window === 'undefined') return 'A'

  const existing = localStorage.getItem(VARIANT_KEY)
  if (existing === 'A' || existing === 'B') return existing

  const created: AbVariant = Math.random() < 0.5 ? 'A' : 'B'
  localStorage.setItem(VARIANT_KEY, created)
  return created
}

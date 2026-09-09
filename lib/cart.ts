export type CartItem = {
  id: number
  documentId?: string
  slug: string
  title: string
  price: number
  quantity: number
  image?: string | null
}

const CART_KEY = 'shop_cart'
const CART_EVENT = 'shop_cart_changed'
const EMPTY_CART: CartItem[] = []
let cachedRaw: string | null = null
let cachedCart: CartItem[] = EMPTY_CART

function notifyCartChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_EVENT))
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART

  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : EMPTY_CART
  } catch {
    return EMPTY_CART
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  notifyCartChanged()
}

export function addToCart(item: CartItem) {
  const cart = getCart()
  const existing = cart.find((p) => p.id === item.id)

  if (existing) {
    existing.quantity += item.quantity
  } else {
    cart.push(item)
  }

  saveCart(cart)
}

export function updateCartQuantity(id: number, quantity: number) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, quantity } : item
  )

  saveCart(cart.filter((item) => item.quantity > 0))
}

export function removeFromCart(id: number) {
  const cart = getCart().filter((item) => item.id !== id)
  saveCart(cart)
}

export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
  notifyCartChanged()
}

export function subscribeToCart(listener: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(CART_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(CART_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART

  const raw = localStorage.getItem(CART_KEY)
  if (raw === cachedRaw) return cachedCart

  cachedRaw = raw
  cachedCart = getCart()
  return cachedCart
}

export function getServerCartSnapshot(): CartItem[] {
  return EMPTY_CART
}

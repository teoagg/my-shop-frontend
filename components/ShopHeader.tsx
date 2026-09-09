'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useSyncExternalStore } from 'react'
import { getServerStoredUser, getStoredUser, logout } from '@/lib/auth'
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeToCart,
} from '@/lib/cart'

function subscribeToUser(listener: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener('storage', listener)
  window.addEventListener('auth_changed', listener)

  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener('auth_changed', listener)
  }
}

export default function ShopHeader() {
  const router = useRouter()
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  )
  const user = useSyncExternalStore(
    subscribeToUser,
    getStoredUser,
    getServerStoredUser
  )

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(247,247,242,0.92)] backdrop-blur">
      <nav className="shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3 font-black tracking-wide">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--foreground)] text-white">
            S
          </span>
          <span>Strapi Shop</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/products">
            Προϊόντα
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/orders">
            Παραγγελίες
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/evaluation">
            Αξιολόγηση
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/cart">
            Καλάθι
            {cartCount > 0 && (
              <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 hover:border-[var(--accent)]"
            >
              Αποσύνδεση
            </button>
          ) : (
            <>
              <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/login">
                Σύνδεση
              </Link>
              <Link className="btn-primary min-h-0 px-3 py-2" href="/register">
                Εγγραφή
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login, setStoredUser, setToken } from '@/lib/auth'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Η σύνδεση απέτυχε'
}

export default function LoginPage() {
  const router = useRouter()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await login(identifier, password)

      setToken(data.jwt)
      setStoredUser(data.user)

      router.push('/products')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <section className="w-full max-w-md rounded-[8px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-[var(--accent)]">
          Λογαριασμός
        </p>
        <h1 className="mt-2 text-3xl font-black">Σύνδεση</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Συνδέσου για να ολοκληρώσεις παραγγελίες και να δεις το ιστορικό σου.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Email ή username</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="field"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">Κωδικός</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              required
            />
          </label>

          {error && (
            <p className="rounded-[8px] bg-red-50 p-3 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Σύνδεση...' : 'Σύνδεση'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Δεν έχεις λογαριασμό;{' '}
          <Link href="/register" className="font-bold text-[var(--accent)]">
            Δημιούργησε έναν
          </Link>
        </p>
      </section>
    </main>
  )
}

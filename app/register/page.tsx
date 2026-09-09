'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { register, setStoredUser, setToken } from '@/lib/auth'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Η εγγραφή απέτυχε'
}

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await register(username, email, password)

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
          Νέος χρήστης
        </p>
        <h1 className="mt-2 text-3xl font-black">Εγγραφή</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Δημιούργησε λογαριασμό για checkout και προσωπικό ιστορικό παραγγελιών.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field"
              minLength={3}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="rounded-[8px] bg-red-50 p-3 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Έχεις ήδη λογαριασμό;{' '}
          <Link href="/login" className="font-bold text-[var(--accent)]">
            Σύνδεση
          </Link>
        </p>
      </section>
    </main>
  )
}

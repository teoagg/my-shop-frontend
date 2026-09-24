'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

type Run = { id: string; status: string; message?: string }
export default function EvaluationRunner() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [run, setRun] = useState<Run | null>(null)
  const [completed, setCompleted] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lastRun = useRef<string | null>(null)
  useEffect(() => {
    let active = true
    async function poll() {
      const token = getToken()
      if (!token) { if (active) setAllowed(false); return }
      try {
        const response = await fetch('/api/evaluation/run', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        if (!active) return
        if (!response.ok) { setAllowed(false); return }
        const data = await response.json()
        if (!active) return
        setAllowed(true); setRun(data.run); setCompleted(data.completed); setError('')
        if (data.run?.status === 'completed' && lastRun.current !== data.run.id) router.refresh()
        lastRun.current = data.run?.id ?? null
      } catch { if (active) setError('Δεν ήταν δυνατή η ενημέρωση κατάστασης. Γίνεται νέα προσπάθεια αυτόματα.') }
    }
    void poll()
    const timer = setInterval(poll, 5000)
    window.addEventListener('auth_changed', poll)
    return () => { active = false; clearInterval(timer); window.removeEventListener('auth_changed', poll) }
  }, [router])
  async function start() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/evaluation/run', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Η εκκίνηση απέτυχε.')
      setRun(data.run); setCompleted(0)
    } catch (e) { setError(e instanceof Error ? e.message : 'Η εκκίνηση απέτυχε.') }
    finally { setBusy(false) }
  }
  if (!allowed) return null
  return <div className="mt-5 rounded-lg border border-[var(--line)] p-4">
    <button type="button" onClick={start} disabled={busy || run?.status === 'running'} className="rounded-lg bg-[var(--accent)] px-4 py-2 font-bold text-white disabled:opacity-50">
      {busy ? 'Εκκίνηση…' : run?.status === 'running' ? 'Η μέτρηση εκτελείται…' : 'Νέα μέτρηση'}
    </button>
    <p className="mt-2 text-sm">Σύγκριση με WooCommerce από τον server · 80 μετρήσεις και 8 προθερμάνσεις. Η εργασία συνεχίζεται αν κλείσεις τη σελίδα.</p>
    <p className="mt-2 text-sm" role="status">{run?.status === 'running' ? `Πρόοδος: ${completed}/88 αιτήσεις` : run?.message}</p>
    {error && <p className="mt-2 text-sm" role="alert">{error}</p>}
  </div>
}

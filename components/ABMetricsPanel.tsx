'use client'

import { useEffect, useState } from 'react'

type VariantSummary = {
  variant: 'A' | 'B'
  sessions: number
  views: number
  addToCart: number
  purchases: number
  recommendationImpressions: number
  recommendationClicks: number
  addToCartRate: number
  conversionRate: number
  recommendationCtr: number
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export default function ABMetricsPanel() {
  const [rows, setRows] = useState<VariantSummary[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/interactions/summary`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRows(data.data || []))
      .catch(() => setRows([]))
  }, [])

  if (rows.length === 0) return null

  return (
    <section className="mt-8 rounded-[8px] border border-[var(--line)] bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-[var(--accent)]">
            A/B testing
          </p>
          <h2 className="mt-1 text-2xl font-black">Μετρικές recommender UX</h2>
        </div>
        <p className="max-w-xl text-sm text-[var(--muted)]">
          Τα δεδομένα προέρχονται από interactions που γράφονται στο Strapi.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="py-3 pr-4">Variant</th>
              <th className="py-3 pr-4">Sessions</th>
              <th className="py-3 pr-4">Views</th>
              <th className="py-3 pr-4">Add to cart</th>
              <th className="py-3 pr-4">Purchases</th>
              <th className="py-3 pr-4">CTR προτάσεων</th>
              <th className="py-3 pr-4">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variant} className="border-b border-[var(--line)] last:border-0">
                <td className="py-3 pr-4 font-black">{row.variant}</td>
                <td className="py-3 pr-4">{row.sessions}</td>
                <td className="py-3 pr-4">{row.views}</td>
                <td className="py-3 pr-4">
                  {row.addToCart} <span className="text-[var(--muted)]">({percent(row.addToCartRate)})</span>
                </td>
                <td className="py-3 pr-4">{row.purchases}</td>
                <td className="py-3 pr-4">{percent(row.recommendationCtr)}</td>
                <td className="py-3 pr-4">{percent(row.conversionRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

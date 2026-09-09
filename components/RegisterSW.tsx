'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    async function registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
      }
    }

    registerServiceWorker().catch(console.error)
  }, [])

  return null
}
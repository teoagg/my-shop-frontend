const STATIC_CACHE = 'shop-static-v3'
const RUNTIME_CACHE = 'shop-runtime-v3'
const STATIC_ASSETS = ['/', '/offline', '/products', '/cart', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const request = event.request
  const url = new URL(request.url)

  // Keep payment scripts and changing Next.js development bundles on the network.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/_next/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          return (await caches.match(request)) || caches.match('/offline')
        })
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse
        }

        const copy = networkResponse.clone()
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
        return networkResponse
      })
    })
  )
})

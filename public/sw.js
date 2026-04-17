// Minimal service worker — enables PWA install eligibility without
// attempting offline caching (Firestore persistence handles app-state offline).
// If we later want asset precaching, replace this with vite-plugin-pwa.
//
// Bump VERSION to invalidate any cached SW and force reinstall on next visit.
const VERSION = 'zen-v2-2026-04-17'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Network-first pass-through. Let the browser do its thing.
  // No-op handler is required by install-prompt heuristics in Chromium.
})

// Minimal service worker — enables PWA install eligibility without
// attempting offline caching (Firestore persistence handles app-state offline).
// If we later want asset precaching, replace this with vite-plugin-pwa.

const VERSION = 'zen-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Network-first pass-through. Let the browser do its thing.
  // No-op handler is required by install-prompt heuristics in Chromium.
})

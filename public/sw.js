// PATH: public/sw.js
// Clientoro Service Worker — minimal version
// Full PWA caching will be added later

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Pass through all requests — no caching for now
  return
})

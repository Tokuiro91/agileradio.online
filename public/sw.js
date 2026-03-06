// BØDEN STADT Radio — Service Worker
// Cache strategy: network-first for pages/API, cache-first for static assets

const CACHE_NAME = "boden-v1"
const OFFLINE_URL = "/offline"

const PRECACHE = [
    "/",
    "/offline",
    "/manifest.json",
    "/favicon.png",
    "/favicon.svg",
]

// ── Install: precache essential assets ───────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    )
    self.skipWaiting()
})

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    )
    self.clients.claim()
})

// ── Fetch: network-first with offline fallback ────────────────────────────────
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET and cross-origin requests
    if (request.method !== "GET" || url.origin !== self.location.origin) return

    // Skip API and WS routes — always network
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/ws")) return

    // Static assets (/_next/, /fonts/, /icons/) — cache-first
    if (
        url.pathname.startsWith("/_next/static") ||
        url.pathname.startsWith("/fonts/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.match(/\.(png|svg|jpg|webp|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone()
                        caches.open(CACHE_NAME).then(c => c.put(request, clone))
                    }
                    return response
                })
            })
        )
        return
    }

    // Pages — network-first, fall back to offline page
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then(c => c.put(request, clone))
                }
                return response
            })
            .catch(() =>
                caches.match(request).then(cached => cached ?? caches.match(OFFLINE_URL))
            )
    )
})

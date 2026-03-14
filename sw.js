const CACHE_NAME = 'mediflow-v2';

// Build pre-cache URLs relative to the service-worker's own scope so the PWA
// works both at the root ("/") and on a sub-path (e.g. GitHub Pages at
// "/mediflow-frontend/") without any hard-coded path assumptions.
const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Only cache GET requests for same-origin resources;
    // non-GET requests (POST, etc.) are passed through to the network unchanged.
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // Network-first: always try to fetch the latest version from the server.
    // Falls back to cache when offline so the app still works without a connection.
    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => caches.match(event.request).then(cached => {
            if (cached) return cached;
            // Main app pages are always pre-cached during install, so this
            // fallback only triggers for non-pre-cached resources while offline.
            if (event.request.mode === 'navigate') return caches.match('./index.html');
        }))
    );
});

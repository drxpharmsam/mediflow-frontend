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

// ── Push Notifications ──────────────────────────────────────────────────────
// Fired by the browser when the backend sends a Web Push message.
// The payload is expected to be a JSON string: { title, body, icon, url }
// Configure on the backend with the VAPID key pair (see .env.example).
self.addEventListener('push', event => {
    let data = { title: 'MediFlow', body: 'You have a new notification.' };
    if (event.data) {
        try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
    }
    const options = {
        body: data.body || '',
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/icon-192.png',
        data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(data.title || 'MediFlow', options));
});

// When the user taps a notification, focus/open the app at the linked URL.
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const target = (event.notification.data && event.notification.data.url) || '/';
    // Normalize to origin-relative path for reliable tab matching
    const targetUrl = new URL(target, self.location.origin).href;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (const client of windowClients) {
                // Compare base paths, ignoring query-string and hash differences
                const clientBase = client.url.split('?')[0].split('#')[0];
                const targetBase = targetUrl.split('?')[0].split('#')[0];
                if (clientBase === targetBase && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(target);
        })
    );
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
        }).catch(() => caches.match(event.request))
    );
});

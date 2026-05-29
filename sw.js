const CACHE_NAME = 'domino-game-v1';
const ASSETS_TO_CACHE = [
    '/domino-game/',
    '/domino-game/index.html',
    '/domino-game/style.css',
    '/domino-game/app.js',
    '/domino-game/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch Service Worker
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(response => {
                        // Clone the response
                        const responseClone = response.clone();

                        // Cache GET requests
                        if (event.request.method === 'GET') {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }

                        return response;
                    })
                    .catch(error => {
                        console.log('Fetch error:', error);
                        // Return offline page if available
                        return caches.match('/domino-game/index.html');
                    });
            })
    );
});

// Background Sync (optional)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-game-state') {
        event.waitUntil(syncGameState());
    }
});

function syncGameState() {
    return Promise.resolve();
}

// Push Notifications (optional)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nova partida disponível!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%2300d4ff" width="192" height="192"/><rect fill="%23001a2e" x="20" y="50" width="30" height="60" rx="4"/><circle cx="30" cy="65" r="3" fill="%23fff"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%2300d4ff" width="192" height="192"/></svg>',
        tag: 'domino-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('Jogo de Dominó', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })
            .then(clientList => {
                // Procura por uma janela já aberta
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === '/domino-game/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Se nenhuma janela estiver aberta, abre uma nova
                if (clients.openWindow) {
                    return clients.openWindow('/domino-game/');
                }
            })
    );
});


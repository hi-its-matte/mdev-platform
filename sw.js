// Service Worker minimale per abilitare l'installazione PWA
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Gestione base delle richieste
    event.respondWith(fetch(event.request));
});
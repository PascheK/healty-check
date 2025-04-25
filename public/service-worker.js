const CACHE_NAME = 'healthy-check-cache-v1';
const urlsToCache = [
  '/', // la page d'accueil
  '/offline.html', // page personnalisée si complètement offline (optionnelle)
];

// 📦 Lors de l'installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker : Installation ✅');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker : Mise en cache des fichiers');
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting(); // Active immédiatement sans attendre
});

// 📦 Lors de l'activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker : Activation ✅');

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker : Suppression de l’ancien cache', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim(); // Prend directement le contrôle des pages ouvertes
});

// 📦 Intercepter les requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Cas d'échec de réseau : OFFLINE
        return caches.match(event.request).then(async (cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // 🔥 Test si userData existe dans localStorage (via un fallback spécial)
          const cache = await caches.open(CACHE_NAME);
          const userData = await cache.match('/userData.json'); // on utilise une astuce si besoin
          
          if (userData) {
            // S'il y a des données utilisateurs => on reste sur l'app
            return caches.match('/');
          }

          // Sinon => vraiment offline
          return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};

  const title = data.title || 'Nouvelle notification';
  const options = {
    body: data.body || 'Vous avez une nouvelle notification 🎯',
    icon: '/favicon-192x192.png', // ajoute une icône si tu veux
    badge: '/favicon-192x192.png', // ajoute une icône de notification si tu veux
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // ➡️ redirige vers ton app quand on clique sur la notif
  );
});

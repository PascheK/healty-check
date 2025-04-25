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
        // Si réponse réussie, on la clone et on la stocke dans le cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si le fetch échoue (offline), on retourne ce qu’on a en cache
        return caches.match(event.request).then((response) => {
          return response || caches.match('/offline.html'); // fallback si tout échoue
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

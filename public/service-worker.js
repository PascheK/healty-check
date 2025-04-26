const CACHE_NAME = 'healthy-check-cache-v1';
const urlsToCache = [
  '/',
  '/offline.html',
];

// 📦 Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker : Installation ✅');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker : Mise en cache des fichiers');
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

// 📦 Activation du Service Worker
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

  self.clients.claim();
});

// 📦 Interception des requêtes
self.addEventListener('fetch', (event) => {
  // ✅ Important : n’intercepter que les GET
  if (event.request.method !== 'GET') {
    return; // Ne pas interférer avec les POST, PUT, DELETE etc.
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // ➡️ Si trouvé dans cache
        }

        return fetch(event.request)
          .then((response) => {
            // ✅ Seulement mettre en cache si c’est un 200 OK
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // 🌪️ Si réseau échoué ET pas de cache
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// 📩 Gestion du push notification
self.addEventListener('push', function(event) {
  console.log('📩 Push reçu:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: {
        url: '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } else {
    console.warn('❌ Push reçu sans data');
  }
});

// 🎯 Clique sur notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 🔄 Pour forcer update du service worker
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

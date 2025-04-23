self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};

  const title = data.title || 'Healty Check 💙';
  const options = {
    body: data.body || 'Tu as une nouvelle notification bien-être.',
    icon: '/public/icon-192x192.png',
    badge: '/public/icon-192x192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

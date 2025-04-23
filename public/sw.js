self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};

  const title = data.title || 'Healty Check 💙';
  const options = {
    body: data.body || 'Tu as une nouvelle notification bien-être.',
    icon: '/favicon-192x192.png',
    badge: '/favicon-192x192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

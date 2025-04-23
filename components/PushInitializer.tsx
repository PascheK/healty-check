'use client';

import { useEffect } from 'react';

export default function PushInitializer() {
  useEffect(() => {
    const register = async () => {
      if (typeof window === 'undefined') return;
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        // 1. Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker enregistré');

        // 2. Vérifier permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('❌ Permission refusée');
          return;
        }

        // 3. S'abonner au PushManager
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BIjnRzxdR46f0Eiwa9rjp7HbVZChQY3ibwuW_znzMCqiaUTt1DI5UattFvFFGlKeOH1Owo042r0CfJwFX96qEWM'),
        });

        // 4. Envoyer l’abonnement au backend
        await fetch('http://84.227.234.181:4000/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });

        console.log('📩 Abonnement envoyé au serveur', subscription);
      } catch (err) {
        console.error('❌ Erreur abonnement Push :', err);
      }
    };

    register();
  }, []);

  return null;
}

// Convertir clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

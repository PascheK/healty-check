'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker enregistré ✅', registration);

        // Vérifier si un nouveau SW est en attente
        if (registration.waiting) {
          console.log('🆕 Nouveau Service Worker détecté, activation immédiate...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload(); // 🔥 Force le refresh
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 Nouveau Service Worker installé, rechargement automatique...');
                window.location.reload();
              }
            });
          }
        });
      }).catch((error) => {
        console.error('Erreur lors de l’enregistrement du Service Worker ❌', error);
      });
    }
  }, []);
}

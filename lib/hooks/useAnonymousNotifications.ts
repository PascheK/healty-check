'use client';

import { useCallback } from 'react';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';

export function useAnonymousNotifications() {
  const initializeAnonymous = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker non supporté');
        return;
      }

      // 🔔 Demander la permission notifications
      const permissionGranted = await notificationService.requestNotificationPermission();
      console.log('🔔 Permission notification accordée:', permissionGranted);

      if (!permissionGranted) {
        console.warn('Notifications refusées');
        return;
      }

      // 👤 Créer/utiliser utilisateur anonyme
      const userId = await authService.createAnonymousUser();
      console.log('👤 Utilisateur prêt:', userId);

      // 🔥 S'abonner aux notifications avec ce userId
      await notificationService.subscribeToPushNotifications(userId);

      console.log('🎯 Abonnement terminé pour:', userId);

    } catch (error) {
      console.error('❌ Erreur initializeAnonymous:', error);
    }
  }, []);

  return { initializeAnonymous };
}

'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';

export default function AnonymousInit() {
  useEffect(() => {

    const setupNotifications = async () => {
      if (Notification.permission === 'default') {
        console.log('🔔 Demande de permission notifications');
  
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('✅ Permission accordée, inscription push...');
        // 👤 Créer un utilisateur anonyme s’il n’existe pas
            authService.createAnonymousUser().catch((err) =>
          console.error('❌ Erreur création anonyme:', err)
        );        } else {
          console.warn('❌ Permission refusée pour notifications');
        }
      } else if (Notification.permission === 'granted') {
        console.log('✅ Déjà autorisé, inscription push...');
                // 👤 Créer un utilisateur anonyme s’il n’existe pas
                authService.createAnonymousUser().catch((err) =>
                  console.error('❌ Erreur création anonyme:', err)
                );
      } else {
        console.warn('🔒 Notifications bloquées par l\'utilisateur');
      }
    };
  

    setupNotifications();

  }, []);

  return null; // Pas besoin d'afficher quoi que ce soit
}

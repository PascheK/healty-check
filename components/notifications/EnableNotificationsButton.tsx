'use client';

import { useState } from 'react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/lib/hooks/useToast'; // Si tu as un système de toast déjà

export default function EnableNotificationsButton() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await notificationService.requestNotificationPermission();
      if (!granted) {
        showToast('error', 'Permission refusée ❌');
        return;
      }

      await notificationService.subscribeToPushNotifications();
      showToast('success', 'Notifications activées ✅');
    } catch (error) {
      console.error('Erreur d\'abonnement:', error);
      showToast('error', 'Erreur lors de l\'abonnement ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={loading}
      className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Activation...' : 'Activer les Notifications 🔔'}
    </button>
  );
}

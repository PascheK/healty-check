'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { useToast } from '@/lib/hooks/useToast';

export function useSyncManager() {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const trySyncPending = async () => {
      const pending = userService.getPendingSync();
      if (pending && navigator.onLine) {
        try {
          setSyncing(true); // 🔥 démarrage de la tentative
          await userService.syncCategories(pending.code, pending.categories);
          userService.removePendingSync();
          showToast('success', 'Synchronisation automatique réussie ✅');
        } catch (error) {
          console.error('Erreur de synchronisation automatique', error);
        } finally {
          setSyncing(false); // 🔥 tentative terminée
        }
      }
    };

    trySyncPending(); // Démarrage immédiat
    window.addEventListener('online', trySyncPending);
    const retryInterval = setInterval(trySyncPending, 30000); // 30 secondes

    return () => {
      window.removeEventListener('online', trySyncPending);
      clearInterval(retryInterval);
    };
  }, [showToast]);

  return { syncing };
}

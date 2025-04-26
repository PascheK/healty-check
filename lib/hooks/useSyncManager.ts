'use client';

import { useEffect, useState, useCallback } from 'react';
import { userService } from '@/services/userService';
import { useToast } from '@/lib/hooks/useToast';
import { Category } from '@/types/user';

export function useSyncManager() {
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const trySyncPending = useCallback(async () => {
    const pending = await userService.getPendingSync();
    if (!pending || !navigator.onLine) return;

    try {
      setSyncing(true);
      await userService.syncCategories(pending.code, pending.categories);
      userService.removePendingSync();
      showToast('success', '✅ Synchronisation réussie');
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    trySyncPending(); // 🔥 Au chargement de la page

    window.addEventListener('online', trySyncPending);
    const interval = setInterval(trySyncPending, 30000); // 🔄 Toutes les 30s

    return () => {
      window.removeEventListener('online', trySyncPending);
      clearInterval(interval);
    };
  }, [trySyncPending]);

  const queueSync = (userCode: string, categories: Category[]) => {
    userService.savePendingSync(userCode, categories);
    console.log('📦 Données mises en attente pour sync');
    trySyncPending(); // 🔥 Tentative immédiate après ajout
  };

  return { syncing, queueSync };
}

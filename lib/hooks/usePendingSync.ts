'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { Category } from '@/types/user';

export function usePendingSync() {
  const [pendingSync, setPendingSync] = useState<{ code: string; categories: Category[] } | null>(null);

  useEffect(() => {
    const loadPendingSync = async () => {
      const pending = await userService.getPendingSync();
      if (pending) {
        setPendingSync(pending);
      }
    };

    loadPendingSync();

    const handleOnline = async () => {
      const pendingNow = await userService.getPendingSync();
      if (pendingNow) {
        setPendingSync(pendingNow);
      } else {
        setPendingSync(null);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return pendingSync;
}

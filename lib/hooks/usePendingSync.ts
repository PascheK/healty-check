// lib/hooks/usePendingSync.ts

'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { Category } from '@/types/user';

export function usePendingSync() {
  const [pendingSync, setPendingSync] = useState<{ code: string; categories: Category[] } | null>(null);

  useEffect(() => {
    const pending = userService.getPendingSync();
    if (pending) {
      setPendingSync(pending);
    }

    const handleOnline = async () => {
      const pendingNow = userService.getPendingSync();
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

'use client';

import { useAnonymousNotifications } from '@/lib/hooks/useAnonymousNotifications';
import { useEffect } from 'react';
 
export default function AnonymousInit() {
  const { initializeAnonymous } = useAnonymousNotifications();

  useEffect(() => {
    initializeAnonymous();
  }, [initializeAnonymous]);

  return null; // Aucun rendu visuel nécessaire
}
'use client';

import { useAnonymousNotifications } from '@/lib/hooks/useAnonymousNotifications';
import { useEffect } from 'react';

export default function AnonymousInit() {
  const { initializeAnonymous } = useAnonymousNotifications();

  // 🔵 Initialise les notifications anonymes au montage du composant
  useEffect(() => {
    initializeAnonymous();
  }, [initializeAnonymous]);

  // 🔵 Aucun affichage visuel nécessaire
  return null;
}

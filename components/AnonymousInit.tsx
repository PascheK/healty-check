'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';

export default function AnonymousInit() {
  useEffect(() => {
    // 👤 Créer un utilisateur anonyme s’il n’existe pas
    authService.createAnonymousUser().catch((err) =>
      console.error('❌ Erreur création anonyme:', err)
    );
  }, []);

  return null; // Pas besoin d'afficher quoi que ce soit
}

'use client';

import { useServiceWorker } from '@/lib/hooks/useServiceWorker';

export default function ServiceWorkerProvider() {
  useServiceWorker();
  return null; // Ce composant ne rend rien d'affiché
}

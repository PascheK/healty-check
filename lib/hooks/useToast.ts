'use client';

import { useContext } from 'react';
import { ToastContext } from '@/lib/contexts/ToastProvider'; // adapte si besoin

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur de ToastProvider');
  }
  return context;
}

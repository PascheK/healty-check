'use client';

import { createContext, useContext, useState } from 'react';

// 🔵 Types
type Toast = {
  type: 'success' | 'error';
  message: string;
};

type ToastContextType = {
  showToast: (type: 'success' | 'error', message: string) => void;
};

// 🔵 Création du contexte
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 🔵 Fournisseur de contexte
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  // Fonction pour afficher un toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // Efface automatiquement après 3 secondes
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Affichage du toast si existant */}
      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded text-sm z-50
            animate-fade-zoom-in shadow-lg transition duration-300 ease-in-out
            ${
              toast.type === 'success'
                ? 'bg-green-600 text-text-primary'
                : 'bg-red-600 text-text-primary'
            }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// 🔵 Hook pour utiliser facilement le ToastContext
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur de ToastProvider');
  }
  return context;
}

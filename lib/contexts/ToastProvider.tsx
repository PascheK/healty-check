'use client';

import { createContext, useContext, useState } from 'react';

type Toast = {
  type: 'success' | 'error';
  message: string;
};

type ToastContextType = {
  showToast: (type: 'success' | 'error', message: string) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // Disparait après 3 sec
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded text-sm z-50
          animate-fade-zoom-in
          shadow-lg
          transition
          duration-30000000
          ease-in-out
          ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

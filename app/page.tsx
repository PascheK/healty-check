'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CitationBienEtre from '@/components/CitationBienEtre';
import OptionsMenu from '@/components/OptionsMenu';

export default function HomePage() {
  const [showOptions, setShowOptions] = useState(false);

  const router = useRouter();
  // 🔔 Demander la permission de notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  }, []);


  return (
    <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-6">Healty Check</h1>
      <CitationBienEtre />
        {/* ⚙️ Bouton flottant options */}
        <button
        onClick={() => setShowOptions(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        ⚙️
      </button>

      {/* 🌫 Overlay + Sidemenu */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          showOptions ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Overlay flouté */}
        <div
          onClick={() => setShowOptions(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Menu latéral animé */}
        <OptionsMenu show={showOptions} onClose={() => setShowOptions(false)} />
      </div>

      <button
        onClick={() => router.push('/login')}
        className="bg-blue-500 text-white px-6 py-2 rounded shadow"
      >
        Accéder à mon espace
      </button>
    </main>
  );
}

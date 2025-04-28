'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CitationBienEtre from '@/components/CitationBienEtre';
 import { authService } from '@/services/authService';
import AnonymousInit from '@/components/AnonymousInit';

export default function HomePage() {
  const [showOptions, setShowOptions] = useState(false);

  const router = useRouter();



  const login = async () => {
    if (await authService.isAuthenticated() && await !authService.isAdmin()) {
      router.replace('/profile'); // remplace dans l’historique
    } else if(await authService.isAuthenticated() && await authService.isAdmin()) {
      router.replace('/admin'); // remplace dans l’historique
    }else{
      router.replace('/login'); // remplace dans l’historique

    }
  }




  return (
    <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center h-screen text-center">
      <AnonymousInit />
      <h1 className="text-3xl font-bold mb-6">Healty Check</h1>
      <CitationBienEtre />
        {/* ⚙️ Bouton flottant options */}
        <button
        onClick={() => setShowOptions(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-text-primary px-4 py-2 rounded-full shadow-lg z-50"
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

      
      </div>

      <button
        onClick={() => login()}
        className="bg-blue-500 text-text-primary px-6 py-2 rounded shadow"
      >
        Accéder à mon espace
      </button>
    </main>
  );
}

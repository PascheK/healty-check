'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import CitationBienEtre from '@/components/CitationBienEtre';
import AnonymousInit from '@/components/AnonymousInit';
import { authService } from '@/services/authService';

export default function HomePage() {
  // 🔵 State
  const [showOptions, setShowOptions] = useState(false); // Affichage du menu d'options

  // 🔵 Hooks
  const router = useRouter();

  // 🔵 Fonction de connexion/redirection
  const login = async () => {
    const isAuth = await authService.isAuthenticated();
    const isAdmin = await authService.isAdmin();
  
    if (isAuth && !isAdmin) {
      router.replace('/profile');
    } else if (isAuth && isAdmin) {
      router.replace('/admin');
    } else {
      router.replace('/login');
    }
  };

  // 🔵 Affichage
  return (
    <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center h-screen text-center">
      {/* Initialisation pour les utilisateurs anonymes */}
      <AnonymousInit />

      {/* Titre de la page */}
      <h1 className="text-3xl font-bold mb-6">Healty Check</h1>

      {/* Citation bien-être */}
      <CitationBienEtre />

      {/* ⚙️ Bouton flottant pour ouvrir les options */}
      <button
        onClick={() => setShowOptions(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-text-primary px-4 py-2 rounded-full shadow-lg z-50"
      >
        ⚙️
      </button>

      {/* 🌫 Overlay + menu latéral (simple pour l'instant) */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          showOptions ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Overlay semi-transparent */}
        <div
          onClick={() => setShowOptions(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />
      </div>

      {/* Bouton principal d'accès */}
      <button
        onClick={login}
        className="bg-blue-500 text-text-primary px-6 py-2 rounded shadow"
      >
        Accéder à mon espace
      </button>
    </main>
  );
}

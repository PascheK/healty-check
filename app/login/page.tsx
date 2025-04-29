'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/authService';

export default function LoginPage() {
  // 🔵 États locaux
  const [code, setCode] = useState(''); // Code saisi par l'utilisateur
  const [error, setError] = useState(''); // Message d'erreur éventuel
  const [loading, setLoading] = useState(false); // Indicateur de chargement pour le bouton
  const [checkingAuth, setCheckingAuth] = useState(true); // Indicateur pour vérifier si utilisateur déjà connecté

  // 🔵 Hook de navigation
  const router = useRouter();

  // 🔵 Vérifie si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const isAdmin = await authService.isAdmin();
        if (isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/profile');
        }
      } else {
        setCheckingAuth(false); // Plus besoin de spinner
      }
    };

    checkAuth();
  }, [router]);

  // 🔵 Gestion de la tentative de connexion
  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.login(code); // Tentative de login avec le code fourni

      const isAdmin = await authService.isAdmin();
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      // Gestion propre des erreurs
      if (err instanceof Error) {
        setError(err.message || 'Une erreur est survenue');
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Affiche un écran de chargement pendant la vérification d'authentification
  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-center">Chargement...</p>
      </main>
    );
  }

  // 🔵 Formulaire de connexion
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="rounded-xl shadow-xl p-6 max-w-sm w-full bg-foreground">
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion 💙</h1>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code personnel"
          className="w-full px-4 py-2 bg-background text-text-secondary border border-border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !code}
          className="w-full bg-blue-500 text-text-primary font-semibold py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        {/* Message d'erreur éventuel */}
        {error && <p className="text-red-400 text-center mt-3">{error}</p>}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/authService';

export default function LoginPage() {
  // 🌟 State
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🌟 Hooks
  const router = useRouter();

  // 🌟 Vérifier si déjà connecté
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
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // 🌟 Gestion du login
  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.login(code);

      const isAdmin = await authService.isAdmin();
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Une erreur est survenue');
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Affichage loading pendant check
  if (checkingAuth) {
    return (
      <main className="min-h-screen  flex items-center justify-center">
        <p className="text-center">Chargement...</p>
      </main>
    );
  }

  // 🌟 Formulaire
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

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}
      </div>
    </main>
  );
}

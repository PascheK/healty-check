'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const quotes = [
"Un petit pas aujourd’hui, c’est déjà un pas de plus qu’hier.",
  "Tu n’as pas besoin d’aller vite, tu dois juste continuer.",
  "Tu fais de ton mieux, et c’est déjà énorme.",
  "Ton existence suffit. Tu n’as rien à prouver.",
  "Même les tempêtes finissent par passer.",
  "Respire. Tu n’as pas besoin de tout contrôler.",
  "Sois doux avec toi-même, tu fais de ton mieux.",
  "Ta valeur ne dépend pas de ta productivité.",
  "Tu as le droit de te reposer.",
  "Aujourd’hui, tu peux choisir la douceur.",
  "Fais de la place pour toi, même un petit coin de ciel.",
  "Tu es plus fort(e) que ce que tu crois.",
  "Ton ressenti est légitime. Écoute-le.",
  "Le simple fait de tenir est déjà courageux.",
  "Accorde-toi la même compassion que tu offrirais à un ami.",
  "Tu as le droit de ne pas aller bien.",
  "Chaque jour est une nouvelle chance.",
  "Ce que tu ressens maintenant n’est pas éternel.",
  "Tu n’as pas besoin d’être parfait(e) pour être aimé(e).",
  "Ton repos est productif.",
  "Prendre soin de soi, ce n’est pas être égoïste, c’est nécessaire.",
  "Tu avances, même quand tu as l’impression de stagner.",
  "Tu peux recommencer, autant de fois qu’il le faut.",
  "Ce que tu vis est important. Tu es important(e).",
  "Sois fier(e) de toi. Même pour les petites choses.",
  "Ta lumière ne s’éteint pas. Parfois elle se repose.",
  "Il n’y a pas de mauvaise manière de prendre soin de soi.",
  "Ralentir, ce n’est pas reculer.",
  "Aujourd’hui est un bon jour pour être doux/douce avec toi-même.",
  "Tu n’es pas seul(e). Même quand tu te sens seul(e)."
];

export default function HomePage() {
  const [quote, setQuote] = useState('');
  const router = useRouter();
  // 🔔 Demander la permission de notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  }, []);
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-6">Healty Check</h1>

      <div className="bg-purple-100 text-purple-800 p-4 rounded mb-6 italic">
        “{quote}”
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

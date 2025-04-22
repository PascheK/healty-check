'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const quotes = [
  "Prends soin de ton corps, c’est le seul endroit où tu es obligé de vivre.",
  "Un petit pas chaque jour devient un grand chemin parcouru.",
  "Respirer. C’est le début de tout.",
  "Tu as survécu à 100 % de tes mauvaises journées. Tu gères.",
  "Il est normal d’avoir besoin de repos. Ça fait aussi partie du chemin.",
];

export default function HomePage() {
  const [quote, setQuote] = useState('');
  const router = useRouter();

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

'use client';

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useChecklist } from '@/lib/hooks/useChecklist';
import { useBonBienEtre } from '@/lib/hooks/useBonBienEtre';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Checklist from '@/components/Checklist';
const API_SECRET = 'X9tPz8*Kw3%Vd4!Ln7@';

export default function ProfilePage() {
  const user = useCurrentUser(API_SECRET);
  const router = useRouter();

  const userCode = typeof window !== 'undefined' ? localStorage.getItem('userCode') : null;
  const { checked, toggle } = useChecklist(userCode);
  const { bon, cooldown, tirerNouveauBon, bonUtilise, utiliserBon, historique } = useBonBienEtre(userCode, API_SECRET, 12);
  const [open, setOpen] = useState(true); // Chaque section est ouverte par défaut

  if (!user) return null;

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Bienvenue, {user.prenom}
      </h1>

      {/* Bon cadeau */}
      {bon && (
  <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
    <h2 className="font-semibold text-lg mb-2">🎁 Bon cadeau</h2>
    <p className="italic text-gray-300">“{bon}”</p>

    <p className="text-sm text-gray-400 mt-2">
      ⏳ Temps restant : {Math.ceil(cooldown / 1000 / 60)} min
    </p>

    <div className="flex justify-center gap-4 mt-4">
      <button
        onClick={tirerNouveauBon}
        disabled={cooldown > 0}
        className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded disabled:opacity-50"
      >
        🔄 Relancer
      </button>

      <button
        onClick={utiliserBon}
        disabled={bonUtilise}
        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        ✅ Utiliser
      </button>
    </div>
  </div>
)}

      {/* Checklist */}
      <Checklist user={user} checked={checked} toggle={toggle} />

      {/* Historique */}
      {historique.length > 0 && (
  <div className="mt-8">
    <h2 className="text-lg font-semibold mb-2">🎁 Bons utilisés</h2>
    <ul className="list-disc ml-6 text-sm text-gray-400">
      {historique.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  </div>
)}

      <button
        onClick={() => {
          localStorage.removeItem('userCode');
          router.push('/');
        }}
        className="mt-6 text-sm underline text-red-500 w-full text-center"
      >
        Se déconnecter
      </button>
    </main>
  );
}

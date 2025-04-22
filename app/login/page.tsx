'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users', {
      headers: {
        Authorization: 'Bearer X9tPz8*Kw3%Vd4!Ln7@', // doit correspondre à .env.local
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => {
        console.error('Erreur :', err.message);
        alert('Erreur d’accès aux données.');
        router.push('/');

      });
  }, []);
  

  const handleLogin = () => {
    const user = users.find((u) => u.code === code);
    if (user) {
      localStorage.setItem('userCode', code);
      router.push('/profile');
    } else {
      alert('Code invalide');
    }
  };

  return (
    <main className="p-6 max-w-sm mx-auto text-center">
      <h1 className="text-xl mb-4">Code d’accès personnel</h1>
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ton code personnel"
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Se connecter
      </button>
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/'); // ou '/connexion' selon tes routes
  };

  return (
    <button onClick={handleLogout} className="mt-6 text-sm underline text-red-500 w-full text-center">
      Déconnexion
    </button>
  );
}

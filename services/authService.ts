// services/authService.ts

import { UserData } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  // 🧠 Login utilisateur
  login: async (code: string): Promise<UserData> => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      throw new Error('Code invalide');
    }

    const user = await res.json();
    localStorage.setItem('userCode', user.code);
    localStorage.setItem('userData', JSON.stringify(user));

    return user;
  },

  // 🧠 Logout utilisateur
  logout: () => {
    localStorage.removeItem('userCode');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  },

  // 🧠 Vérifie si utilisateur connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('userCode');
  },

  // 🧠 Vérifie si utilisateur est admin
  isAdmin: (): boolean => {
    const user = authService.getUser();
    return user?.role === 'admin';
  },

  // 🧠 Récupérer l'utilisateur du localStorage
  getUser: (): UserData | null => {
    const user = localStorage.getItem('userData');
    return user ? JSON.parse(user) : null;
  },

  // 🧠 Charger l'utilisateur depuis l'API
  fetchCurrentUser: async (): Promise<UserData | null> => {
    const code = localStorage.getItem('userCode');
    if (!code) return null;

    try {
      const res = await fetch(`${API_URL}/api/users/${code}`);
      if (!res.ok) {
        throw new Error('Erreur serveur');
      }

      const user: UserData = await res.json();
      localStorage.setItem('userData', JSON.stringify(user));
      return user;
    } catch (error) {
      const cachedUser = authService.getUser();
      if (cachedUser) {
        return cachedUser;
      }

      console.error('❌ Aucun cache utilisateur disponible');
      return null;
    }
  },
};

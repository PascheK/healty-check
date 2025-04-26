// services/authService.ts
import { generateUniqueId } from '@/utils/generateUniqueId';
import { UserData } from '@/types/user';
import { notificationService } from '@/services/notificationService';
import { storageService } from './storageService';

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
    await storageService.setItem('userCode', user.code);
    await storageService.setItem('userData', user); // ⬅️ Pas besoin de stringify

    // 🔁 Fusion avec un compte anonyme s’il existe
    const anonId = await storageService.getItem('userId');

    if (anonId && anonId.startsWith('anon-') && anonId !== user.code) {
      try {
        await fetch(`${API_URL}/api/notifications/merge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromAnonId: anonId,
            toUserId: user.code,
          }),
        });

        console.log('✅ Migration de l’abonnement depuis', anonId);
        await storageService.removeItem('userId');
      } catch (err) {
        console.error('❌ Erreur migration subscription:', err);
      }
    }

    return user;
  },

  // 🧠 Logout utilisateur
  logout: async () => {
    await storageService.removeItem('userCode');
    await storageService.removeItem('userData');
    await storageService.removeItem('token');
  },

  // 🧠 Vérifie si utilisateur connecté
  isAuthenticated: async (): Promise<boolean> => {
    const code = await storageService.getItem('userCode');
    return !!code;
  },

  // 🧠 Vérifie si utilisateur est admin
  isAdmin: async (): Promise<boolean> => {
    const user = await authService.getUser();
    return user?.role === 'admin';
  },

  // 🧠 Récupérer l'utilisateur du storage
  getUser: async (): Promise<UserData | null> => {
    const user = await storageService.getItem<UserData>('userData');
    return user ?? null;
  },

  // 🧠 Charger l'utilisateur depuis l'API
  fetchCurrentUser: async (): Promise<UserData | null> => {
    const code = await storageService.getItem('userCode');
    if (!code) return null;

    try {
      const res = await fetch(`${API_URL}/api/users/${code}`);
      if (!res.ok) {
        throw new Error('Erreur serveur');
      }

      const user: UserData = await res.json();
      await storageService.setItem('userData', user);
      return user;
    } catch (error) {
      console.error('❌ Erreur serveur, tentative de récupération cache');
      const cachedUser = await authService.getUser();
      if (cachedUser) {
        return cachedUser;
      }
      return null;
    }
  },

  // 🧠 Créer un utilisateur anonyme
  createAnonymousUser: async (): Promise<string> => {
    let anonId = await storageService.getItem('userId');

    if (!anonId) {
      anonId = `anon-${generateUniqueId()}`;
      await storageService.setItem('userId', anonId);

      await fetch(`${API_URL}/api/users/anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: anonId }),
      });
    }

    // ➡️ Ensuite, tentative inscription aux notifications
    try {
      await notificationService.subscribeToPushNotifications(anonId);
      console.log('✅ Abonnement push lié à l\'utilisateur anonyme');
    } catch (error) {
      console.error('❌ Erreur abonnement push anonyme:', error);
    }

    return anonId;
  },
};

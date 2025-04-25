// services/authService.ts
import { generateUniqueId } from '@/utils/generateUniqueId';
import { UserData } from '@/types/user';
import { notificationService } from '@/services/notificationService';

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
  
    // 🔁 Fusion avec un compte anonyme s’il existe
    const anonId = localStorage.getItem('userId');
  
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
        localStorage.removeItem('userId');
      } catch (err) {
        console.error('❌ Erreur migration subscription:', err);
      }
    }
  
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
   createAnonymousUser : async (): Promise<string> => {
    let anonId = localStorage.getItem('userId');
    if (!anonId) {
      anonId = `${generateUniqueId()}`;
      localStorage.setItem('userId', anonId);
  
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: anonId }),
      });
    }
  
    // ➡️ Ensuite, tenter inscription aux notifications directement
    try {
      await notificationService.subscribeToPushNotifications(anonId);
      console.log('✅ Abonnement push lié à l\'utilisateur anonyme');
    } catch (error) {
      console.error('❌ Erreur abonnement push anonyme:', error);
    }
  
    return anonId;
  }
};

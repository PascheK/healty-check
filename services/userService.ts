import { UserData, Category } from '@/types/user';
import { GiftWallet } from '@/types/gift';
import { storageService } from './storageService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  // 🧠 Cocher / décocher un objectif
  toggleGoal: async (user: UserData, categoryName: string, goalIndex: number): Promise<UserData> => {
    const updated = { ...user };
    const category = updated.categories.find((c) => c.name === categoryName);
    if (!category) return user;

    category.goals[goalIndex].checked = !category.goals[goalIndex].checked;
    await storageService.setItem('userData', updated);

    fetch(`${API_URL}/api/users/${user.code}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updated.categories }),
    }).catch((err) => console.error('❌ Erreur de synchronisation :', err));

    return updated;
  },

  // 🔁 Sync total des catégories (ex : en ligne après modif offline)
  syncCategories: async (code: string, categories: Category[]) => {
    const res = await fetch(`${API_URL}/api/users/${code}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });

    if (!res.ok) throw new Error('Erreur lors de la synchronisation des catégories');
  },

  // 🔍 Récupérer un utilisateur précis
  fetchUser: async (code: string): Promise<UserData> => {
    const res = await fetch(`${API_URL}/api/users/${code}`);
    if (!res.ok) throw new Error('Erreur lors du chargement du profil');
    return res.json();
  },

  // 📋 Liste de tous les utilisateurs
  getAll: async (): Promise<UserData[]> => {
    const res = await fetch(`${API_URL}/api/users`);
    if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return res.json();
  },

  // ➕ Créer un utilisateur (admin ou user)
  createUser: async (data: { firstName: string; code: string; role: 'user' | 'admin'; }): Promise<UserData> => {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Erreur lors de la création de l’utilisateur');
    return res.json();
  },

  // ❌ Supprimer un utilisateur
  deleteUser: async (code: string) => {
    const res = await fetch(`${API_URL}/api/users/${code}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur lors de la suppression de l’utilisateur');
  },

  // 📦 Gestion du pendingSync (offline)
  savePendingSync: async (code: string, newCategories: Category[]) => {
    const pending = await userService.getPendingSync();

    if (pending && pending.code === code) {
      // 🔄 Fusion des données
      const mergedCategories: Category[] = [...pending.categories];

      newCategories.forEach((newCat) => {
        const existingCat = mergedCategories.find((cat) => cat.name === newCat.name);
        if (existingCat) {
          newCat.goals.forEach((newGoal) => {
            if (!existingCat.goals.some((g) => g.title === newGoal.title)) {
              existingCat.goals.push(newGoal);
            }
          });
        } else {
          mergedCategories.push(newCat);
        }
      });

      await storageService.setItem('pendingSync', { code, categories: mergedCategories });
    } else {
      await storageService.setItem('pendingSync', { code, categories: newCategories });
    }
  },

  removePendingSync: async () => {
    await storageService.removeItem('pendingSync');
  },

  getPendingSync: async (): Promise<{ code: string; categories: Category[] } | null> => {
    const pending = await storageService.getItem('pendingSync');
    return pending ? (pending as { code: string; categories: Category[] }) : null;
  },

  getUsersWithSubscription: async (): Promise<UserData[]> => {
    const allUsers = await userService.getAll();
    return allUsers.filter((u) => u.subscription);
  },

  // 🎁 Bons cadeaux - Backend
  fetchGiftWallet: async (userId: string): Promise<GiftWallet> => {
    const res = await fetch(`${API_URL}/api/gifts/wallet?userId=${userId}`);
    if (!res.ok) throw new Error('Erreur lors du chargement du portefeuille de bons');
    return res.json();
  },

  useGift: async (userId: string, giftEntryId: string) => {
    const res = await fetch(`${API_URL}/api/gifts/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, giftEntryId }),
    });

    if (!res.ok) throw new Error('Erreur lors de l\'utilisation du bon');
    await userService.syncGiftWallet(userId);
  },

  rerollGift: async (userId: string) => {
    const res = await fetch(`${API_URL}/api/gifts/reroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) throw new Error('Erreur lors du reroll');
    await userService.syncGiftWallet(userId);
  },

  acceptGift: async (userId: string) => {
    const res = await fetch(`${API_URL}/api/gifts/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) throw new Error('Erreur lors de l\'acceptation du bon');
  },

  // 🎁 Bons cadeaux - Local
  saveGiftWalletLocal: async (wallet: GiftWallet) => {
    await storageService.setItem('giftWallet', wallet);
  },

  getGiftWalletLocal: async (): Promise<GiftWallet | null> => {
    const local = await storageService.getItem('giftWallet');
    return local ?? null;
  },

  syncGiftWallet: async (userId: string) => {
    try {
      const wallet = await userService.fetchGiftWallet(userId);
      await userService.saveGiftWalletLocal(wallet);
      console.log('✅ Synchronisation des bons terminée');
      return wallet;
    } catch (err) {
      console.error('❌ Erreur sync portefeuille :', err);
      throw err;
    }
  },
};

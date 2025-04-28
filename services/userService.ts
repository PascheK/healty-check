import { UserData, Category } from '@/types/user';
import { GiftWallet } from '@/types/gift'; 

import { storageService } from './storageService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  // 🧠 Toggle un objectif (local + sync backend)
  toggleGoal: async (user: UserData, categoryName: string, goalIndex: number): Promise<UserData> => {
    const updated = { ...user };
    const category = updated.categories.find((c) => c.name === categoryName);
    if (!category) return user;

    category.goals[goalIndex].checked = !category.goals[goalIndex].checked;
    await storageService.setItem('userData', updated); // 🔥 PAS besoin de JSON.stringify

    fetch(`${API_URL}/api/users/${user.code}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updated.categories }),
    }).catch((err) => console.error('❌ Erreur de synchronisation :', err));

    return updated;
  },

  // 🧠 Synchroniser toutes les catégories avec le serveur
  syncCategories: async (code: string, categories: Category[]) => {
    const res = await fetch(`${API_URL}/api/users/${code}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la synchronisation des catégories');
    }
  },

  // 🧠 Récupérer un utilisateur par son code
  fetchUser: async (code: string): Promise<UserData> => {
    const res = await fetch(`${API_URL}/api/users/${code}`);
    if (!res.ok) throw new Error('Erreur lors du chargement du profil');
    return res.json();
  },

  // 🧠 Récupérer tous les utilisateurs
  getAll: async (): Promise<UserData[]> => {
    const res = await fetch(`${API_URL}/api/users`);
    if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return res.json();
  },

  // 🧠 Créer un nouvel utilisateur
  createUser: async (data: { firstName: string; code: string; role: 'user' | 'admin'; }): Promise<UserData> => {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la création de l’utilisateur');
    }

    return res.json();
  },

  // 🧠 Supprimer un utilisateur
  deleteUser: async (code: string) => {
    const res = await fetch(`${API_URL}/api/users/${code}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Erreur lors de la suppression de l’utilisateur');
    }
  },

  // 🧠 Gestion du pendingSync
  savePendingSync: async (code: string, newCategories: Category[]) => {
    console.log('📝 Début de savePendingSync');
    console.log('➡️ Code utilisateur:', code);
    console.log('➡️ Nouvelles catégories reçues:', newCategories);

    const pending = await userService.getPendingSync(); // 🔥 ATTENDRE l'IndexedDB
    console.log('📦 Pending actuel dans IndexedDB:', pending);

    if (pending && pending.code === code) {
      console.log('🔄 Fusion avec les données existantes');

      const mergedCategories: Category[] = [...pending.categories];

      newCategories.forEach((newCat) => {
        const existingCat = mergedCategories.find((cat) => cat.name === newCat.name);
        if (existingCat) {
          console.log(`🔍 Catégorie existante trouvée: ${newCat.name}`);

          newCat.goals.forEach((newGoal) => {
            const alreadyExists = existingCat.goals.some((g) => g.title === newGoal.title);
            if (!alreadyExists) {
              console.log(`➕ Ajout de l'objectif: ${newGoal.title} dans ${existingCat.name}`);
              existingCat.goals.push(newGoal);
            } else {
              console.log(`⚠️ Objectif déjà présent: ${newGoal.title} dans ${existingCat.name}`);
            }
          });

        } else {
          console.log(`🆕 Nouvelle catégorie ajoutée: ${newCat.name}`);
          mergedCategories.push(newCat);
        }
      });

      console.log('✅ Résultat final fusionné:', mergedCategories);
      await storageService.setItem('pendingSync', { code, categories: mergedCategories });
      console.log('📥 Fusion sauvegardée dans pendingSync');

    } else {
      await storageService.setItem('pendingSync', { code, categories: newCategories });
      console.log('📥 Nouvelle sauvegarde dans pendingSync');
    }
  },

  removePendingSync: async () => {
    await storageService.removeItem('pendingSync');
  },

  getPendingSync: async (): Promise<{ code: string; categories: Category[] } | null> => {
    const pending = await storageService.getItem('pendingSync');
    return pending ? pending as { code: string; categories: Category[] } : null;
  },

  getUsersWithSubscription: async (): Promise<UserData[]> => {
    const allUsers = await userService.getAll();
    return allUsers.filter((u) => u.subscription); // Filtre uniquement ceux qui ont subscription
  },
  // 🎁 Récupérer le portefeuille de bons (depuis le backend)
fetchGiftWallet: async (userId: string): Promise<GiftWallet> => {
  const res = await fetch(`${API_URL}/api/gifts/wallet?userId=${userId}`);
  if (!res.ok) throw new Error('Erreur lors du chargement du portefeuille de bons');
  return res.json();
},

// 🎁 Stocker localement le portefeuille
saveGiftWalletLocal: async (wallet: GiftWallet) => {
  await storageService.setItem('giftWallet', wallet);
},

// 🎁 Charger le portefeuille depuis local
getGiftWalletLocal: async (): Promise<GiftWallet | null> => {
  const local = await storageService.getItem('giftWallet');
  return local ? (local as GiftWallet) : null;
},

// 🎁 Synchroniser les bons avec serveur (forcément online)
syncGiftWallet: async (userId: string) => {
  try {
    const wallet = await userService.fetchGiftWallet(userId);
    await userService.saveGiftWalletLocal(wallet);
    console.log('✅ Synchronisation des bons terminée');
    return wallet;
  } catch (err) {
    console.error('❌ Erreur lors de la synchronisation des bons :', err);
    throw err;
  }
},

// 🎯 Utiliser un bon
useGift: async (userId: string, giftEntryId: string) => {
  const res = await fetch(`${API_URL}/api/gifts/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, giftEntryId }),
  });

  if (!res.ok) throw new Error('Erreur lors de l\'utilisation du bon');

  // Après utilisation, resynchroniser le portefeuille
  await userService.syncGiftWallet(userId);
},

// 🎲 Reroll un bon
rerollGift: async (userId: string) => {
  const res = await fetch(`${API_URL}/api/gifts/reroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error('Erreur lors du reroll');

  // Après reroll, resynchroniser le portefeuille
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



};

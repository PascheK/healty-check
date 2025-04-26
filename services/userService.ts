// services/userService.ts

import { UserData, Category } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  // 🧠 Toggle un objectif (local + sync backend)
  toggleGoal: (user: UserData, categoryName: string, goalIndex: number): UserData => {
    const updated = { ...user };
    const category = updated.categories.find((c) => c.name === categoryName);
    if (!category) return user;

    category.goals[goalIndex].checked = !category.goals[goalIndex].checked;

    localStorage.setItem('userData', JSON.stringify(updated));

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

    if (!res.ok) {
      throw new Error('Erreur lors du chargement du profil');
    }

    return res.json();
  },

  // 🧠 Récupérer tous les utilisateurs
  getAll: async (): Promise<UserData[]> => {
    const res = await fetch(`${API_URL}/api/users`);

    if (!res.ok) {
      throw new Error('Erreur lors du chargement des utilisateurs');
    }

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

  // 🧠 Gestion du pendingSync (localStorage)
  savePendingSync: (code: string, newCategories: Category[]) => {
    const pending = userService.getPendingSync();
  
    if (pending && pending.code === code) {
      // 🔥 Fusionner intelligemment les catégories
      const mergedCategories: Category[] = [...pending.categories];
  
      newCategories.forEach((newCat) => {
        const existingCat = mergedCategories.find((cat) => cat.name === newCat.name);
        if (existingCat) {
          // ➡️ Ajouter uniquement les nouveaux objectifs
          newCat.goals.forEach((newGoal) => {
            if (!existingCat.goals.some((g) => g.title === newGoal.title)) {
              existingCat.goals.push(newGoal);
            }
          });
        } else {
          // ➡️ Nouvelle catégorie complète
          mergedCategories.push(newCat);
        }
      });
  
      localStorage.setItem('pendingSync', JSON.stringify({ code, categories: mergedCategories }));
    } else {
      // ➡️ Pas d'existant ➔ sauvegarder tel quel
      localStorage.setItem('pendingSync', JSON.stringify({ code, categories: newCategories }));
    }
  },

  removePendingSync: () => {
    localStorage.removeItem('pendingSync');
  },

  getPendingSync: (): { code: string; categories: Category[] } | null => {
    const pending = localStorage.getItem('pendingSync');
    return pending ? JSON.parse(pending) : null;
  },
};

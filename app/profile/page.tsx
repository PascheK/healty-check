'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useModal } from '@/lib/hooks/useModal';
import { useToast } from '@/lib/hooks/useToast';
import { useSyncManager } from '@/lib/hooks/useSyncManager';

import { UserData } from '@/types/user';

import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

import Checklist from '@/components/Checklist';
import LogoutButton from '@/components/LogoutButton';
import AddCategoryModal from '@/components/AddCategoryModal';
import FloatingActions from '@/components/FloatingActions';
import AddGoalModal from '@/components/AddGoalModal';


export default function ProfilePage() {
  // 🌟 State
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSync, setLoadingSync] = useState(false);

  // 🌟 Hooks
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen, isClosing, openModal, closeModal } = useModal();
  const { isOpen: isGoalModalOpen, isClosing: isGoalModalClosing, openModal: openGoalModal, closeModal: closeGoalModal } = useModal();
  const { syncing } = useSyncManager();
  
  // 🌟 Initialisation de la page
  useEffect(() => {
    const initProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const data = await authService.fetchCurrentUser();
      if (!data) {
        console.error('Utilisateur introuvable');
      }

      setUser(data);
      setLoading(false);
    };

    const syncPending = async () => {
      const pending = userService.getPendingSync();
      if (pending) {
        try {
          await userService.syncCategories(pending.code, pending.categories);
          userService.removePendingSync();
          showToast('success', 'Synchronisation automatique réussie ✅');
        } catch (error) {
          console.error('Erreur pendant la tentative de resynchronisation', error);
        }
      }
    };

    initProfile();
    syncPending();

    window.addEventListener('online', syncPending);

    return () => {
      window.removeEventListener('online', syncPending);
    };
  }, [router, showToast]);

  // 🌟 Fonctions

  const handleAddCategory = async (categoryName: string) => {
    if (!user) return;

    const exists = user.categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (exists) {
      showToast('error', 'Catégorie déjà existante ❌');
      return;
    }

    // ✅ D'abord on modifie le user local
    const updatedUser = {
     ...user,
     categories: [
       ...user.categories,
       { name: categoryName, goals: [] }
    ],
    };
 
    setUser(updatedUser); // 🔥 ça met à jour la vue immédiatement
    localStorage.setItem('userData', JSON.stringify(updatedUser)); // 🔥 sauvegarde local immédiate
    showToast('success', 'Catégorie ajoutée ✅');
  
    await syncUser(updatedUser);
  };

  const handleAddGoal = async (categoryName: string, goalTitle: string) => {
    if (!user) return;

    const foundCategory = user.categories.find((cat) => cat.name === categoryName);
    if (!foundCategory) return;

    const exists = foundCategory.goals.some(
      (goal) => goal.title.toLowerCase() === goalTitle.toLowerCase()
    );

    if (exists) {
      showToast('error', 'Objectif déjà existant ❌');
      return;
    }

    const updatedUser = {
      ...user,
      categories: user.categories.map((cat) =>
        cat.name === categoryName
          ? { ...cat, goals: [...cat.goals, { title: goalTitle, checked: false }] }
          : cat
      ),
    };

    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    showToast('success', 'Objectif ajouté 🎯');

    await syncUser(updatedUser);
  };

  const syncUser = async (updatedUser: UserData) => {
    try {
      setLoadingSync(true);
      await userService.syncCategories(updatedUser.code, updatedUser.categories);
    } catch (error) {
      console.error(error);
      showToast('error', 'Erreur de synchronisation ❌');
      userService.savePendingSync(updatedUser.code, updatedUser.categories);
    } finally {
      setLoadingSync(false);
    }
  };

  const toggleGoal = (categoryName: string, goalIndex: number) => {
    const updated = userService.toggleGoal(user!, categoryName, goalIndex);
    setUser(updated);
  };

  // 🌟 Affichage
  if (loading) {
    return <p className="text-center p-6 text-white">Chargement...</p>;
  }

  if (!user) {
    return <p className="text-center text-red-500">Impossible de récupérer le profil.</p>;
  }

  return (
    <main className="p-6 max-w-md mx-auto relative">
      {syncing && (
  <div className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
    ⏳ Synchronisation en cours...
  </div>
)}
      {loadingSync && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
          Synchronisation...
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-6">
        Salut {user.firstName} {user.lastName} 👋
      </h1>
      <div className="p-6 text-white min-h-screen bg-[#1e1e2e] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Notifications Push 🚀</h1>
    </div>
      <Checklist categories={user.categories} onToggle={toggleGoal} />
      <LogoutButton />
      <FloatingActions onAddCategory={openModal} onAddGoal={openGoalModal} />

      <AddCategoryModal
        isOpen={isOpen}
        isClosing={isClosing}
        onClose={closeModal}
        onAddCategory={handleAddCategory}
      />

      <AddGoalModal
        isOpen={isGoalModalOpen}
        isClosing={isGoalModalClosing}
        onClose={closeGoalModal}
        onAddGoal={handleAddGoal}
        categories={user?.categories.map((c) => c.name) || []}
      />
    </main>
  );
}

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
import { storageService } from '@/services/storageService';
import { useConfirm } from '@/lib/hooks/useConfirm'; // N'oublie pas !


export default function ProfilePage() {
  // 🌟 State
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeEdition, setModeEdition] = useState(false);

  // 🌟 Hooks
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen, isClosing, openModal, closeModal } = useModal();
  const { isOpen: isGoalModalOpen, isClosing: isGoalModalClosing, openModal: openGoalModal, closeModal: closeGoalModal } = useModal();
  const { syncing, queueSync } = useSyncManager();
  const { confirm, ConfirmationModal } = useConfirm(); 
  // 🌟 Initialisation de la page
  useEffect(() => {
    const initProfile = async () => {
      if (!(await authService.isAuthenticated())) {
        router.push('/login');
        return;
      }
    
      const pending = await userService.getPendingSync();
      if (pending) {
        // 🔥 Si il y a un pendingSync, ne pas écraser ce qu'on a localement
        const cachedUser = await authService.getUser();
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          return;
        }
      }
    
      const data = await authService.fetchCurrentUser();
      if (!data) {
        console.error('Utilisateur introuvable');
      }
    
      setUser(data);
      setLoading(false);
    };
    

    const syncPending = async () => {
      const pending = await  userService.getPendingSync();
      if (pending) {
        try {
          await userService.syncCategories(pending.code, pending.categories);
          await userService.removePendingSync();
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
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Catégorie ajoutée ✅');
  
    queueSync(updatedUser.code, updatedUser.categories); // ➡️ NOUVEAU : file d'attente

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
    console.log('🔵 User après ajout:', updatedUser);
    await storageService.setItem('userData', updatedUser);
   
    showToast('success', 'Objectif ajouté 🎯');

    queueSync(updatedUser.code, updatedUser.categories); // ➡️ Utiliser la file d'attente aussi

  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!user) return;
  
    const accepted = await confirm({
      title: 'Supprimer cette catégorie ?',
      message: `Veux-tu vraiment supprimer "${categoryName}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });
    
    if (!accepted) return;
    const updatedUser = {
      ...user,
      categories: user.categories.filter((cat) => cat.name !== categoryName),
    };
  
    setUser(updatedUser);
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Catégorie supprimée ✅');
  
    queueSync(updatedUser.code, updatedUser.categories);
  };
  
  const handleDeleteGoal = async (categoryName: string, goalTitle: string) => {
    if (!user) return;
    const accepted = await confirm({
      title: 'Supprimer cette objectif ?',
      message: `Veux-tu vraiment supprimer "${goalTitle}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });
    if (!accepted) return;

    const updatedUser = {
      ...user,
      categories: user.categories.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              goals: cat.goals.filter((goal) => goal.title !== goalTitle),
            }
          : cat
      ),
    };
  
    setUser(updatedUser);
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Objectif supprimé ✅');
  
    queueSync(updatedUser.code, updatedUser.categories);
  };

  const toggleGoal = async (categoryName: string, goalIndex: number) => {
    const updated = await userService.toggleGoal(user!, categoryName, goalIndex);
    setUser(updated);
  };
  const handleLogout = async () => {
    await authService.logout();
    router.push('/'); // ou '/connexion' selon tes routes
  };


  // 🌟 Affichage
  if (loading) {
    return <p className="text-center p-6 text-white">Chargement...</p>;
  }

  if (!user) {
    return <p className="text-center text-red-500">Impossible de récupérer le profil.</p>;
  }

  return (
    <>
    <ConfirmationModal />
    <main className="p-6 max-w-md mx-auto relative">
      {syncing && (
  <div className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
    ⏳ Synchronisation en cours...
  </div>
)}
 

      <h1 className="text-3xl font-bold text-center mb-6">
        Salut {user.firstName} {user.lastName}
      </h1>
 
      <Checklist 
        modeEdition={modeEdition}
      categories={user.categories}
  onToggle={toggleGoal}
  onDeleteCategory={handleDeleteCategory}
  onDeleteGoal={handleDeleteGoal} />
      <FloatingActions onAddCategory={openModal} onAddGoal={openGoalModal} onToggleEdition={() => setModeEdition((prev) => !prev)} modeEdition={modeEdition} onLogout={handleLogout}/>

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
    </>
   
  );
}

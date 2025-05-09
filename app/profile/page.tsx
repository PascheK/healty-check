'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useModal } from '@/lib/hooks/useModal';
import { useToast } from '@/lib/hooks/useToast';
import { useSyncManager } from '@/lib/hooks/useSyncManager';
import { useConfirm } from '@/lib/hooks/useConfirm'; 

import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { storageService } from '@/services/storageService';

import Checklist from '@/components/Checklist';
import LogoutButton from '@/components/LogoutButton';
import AddCategoryModal from '@/components/AddCategoryModal';
import FloatingActions from '@/components/FloatingActions';
import AddGoalModal from '@/components/AddGoalModal';
import GiftWallet from '@/components/GiftWallet';
import DailyGift from '@/components/DailyGift';

import { UserData } from '@/types/user';

export default function ProfilePage() {
  // 🔵 États locaux
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeEdition, setModeEdition] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0); // utilisé pour forcer le refresh de GiftWallet

  // 🔵 Hooks
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen, isClosing, openModal, closeModal } = useModal();
  const { isOpen: isGoalModalOpen, isClosing: isGoalModalClosing, openModal: openGoalModal, closeModal: closeGoalModal } = useModal();
  const { syncing, queueSync } = useSyncManager();
  const { confirm, ConfirmationModal } = useConfirm();

  // 🔵 Initialisation de la page
  useEffect(() => {
    const initProfile = async () => {
      if (!(await authService.isAuthenticated())) {
        router.push('/login'); // Redirige si non connecté
        return;
      }

      const pending = await userService.getPendingSync();
      if (pending) {
        // Si une synchronisation est en attente, charger les données locales
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
      const pending = await userService.getPendingSync();
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

  // 🔵 Ajouter une catégorie
  const handleAddCategory = async (categoryName: string) => {
    if (!user) return;

    const exists = user.categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (exists) {
      showToast('error', 'Catégorie déjà existante ❌');
      return;
    }

    const updatedUser = {
      ...user,
      categories: [...user.categories, { name: categoryName, goals: [] }],
    };

    setUser(updatedUser);
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Catégorie ajoutée ✅');

    queueSync(updatedUser.code, updatedUser.categories);
  };

  // 🔵 Ajouter un objectif
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
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Objectif ajouté 🎯');

    queueSync(updatedUser.code, updatedUser.categories);
  };

  // 🔵 Supprimer une catégorie
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

  // 🔵 Supprimer un objectif
  const handleDeleteGoal = async (categoryName: string, goalTitle: string) => {
    if (!user) return;

    const accepted = await confirm({
      title: 'Supprimer cet objectif ?',
      message: `Veux-tu vraiment supprimer "${goalTitle}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });

    if (!accepted) return;

    const updatedUser = {
      ...user,
      categories: user.categories.map((cat) =>
        cat.name === categoryName
          ? { ...cat, goals: cat.goals.filter((goal) => goal.title !== goalTitle) }
          : cat
      ),
    };

    setUser(updatedUser);
    await storageService.setItem('userData', updatedUser);
    showToast('success', 'Objectif supprimé ✅');

    queueSync(updatedUser.code, updatedUser.categories);
  };

  // 🔵 Cocher/décocher un objectif
  const toggleGoal = async (categoryName: string, goalIndex: number) => {
    const updated = await userService.toggleGoal(user!, categoryName, goalIndex);
    setUser(updated);
  };

  // 🔵 Déconnexion
  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  // 🔵 Quand un cadeau est accepté
  const handleGiftAccepted = async () => {
    setRefreshFlag((prev) => prev + 1); // Rafraîchir le GiftWallet
  };

  // 🔵 Affichage
  if (loading) {
    return <p className="text-center p-6 text-text-primary">Chargement...</p>;
  }

  if (!user) {
    return <p className="text-center text-red-500">Impossible de récupérer le profil.</p>;
  }

  return (
    <>
      <ConfirmationModal />
      <main className="p-6 max-w-md mx-auto relative min-h-screen">
        {/* Affichage de la synchronisation */}
        {syncing && (
          <div className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
            ⏳ Synchronisation en cours...
          </div>
        )}

        {/* Titre de la page */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Salut {user.firstName} {user.lastName}
        </h1>

        {/* Contenu principal */}
        <div className="flex flex-col w-auto gap-8 min-h-screen">
          <DailyGift userId={user.code} onGiftAccepted={handleGiftAccepted} />
          <Checklist 
            modeEdition={modeEdition}
            categories={user.categories}
            onToggle={toggleGoal}
            onDeleteCategory={handleDeleteCategory}
            onDeleteGoal={handleDeleteGoal}
          />
          <FloatingActions 
            onAddCategory={openModal}
            onAddGoal={openGoalModal}
            onToggleEdition={() => setModeEdition((prev) => !prev)}
            modeEdition={modeEdition}
            onLogout={handleLogout}
          />
          <GiftWallet userId={user.code} key={refreshFlag} />
        </div>

        {/* Modales */}
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

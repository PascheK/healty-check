'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

import { useModal } from '@/lib/hooks/useModal';

import AddUserModal from '@/components/admin/AddUserModal';
import UserListModal from '@/components/admin/UserListModal';
import LogoutButton from '@/components/LogoutButton';
import SendNotificationModal from '@/components/admin/SendNotificationModal';

export default function AdminPage() {
  // 🌟 State
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');

  // 🌟 Hooks
  const router = useRouter();
  const { isOpen: isAddOpen, isClosing: isAddClosing, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isListOpen, isClosing: isListClosing, openModal: openListModal, closeModal: closeListModal } = useModal();
  const { isOpen: isNotifOpen, isClosing: isNotifClosing, openModal: openNotifModal, closeModal: closeNotifModal } = useModal();

  // 🌟 Vérifier l'authentification admin
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      const isAdmin = await authService.isAdmin();

      if (!isAuth || !isAdmin) {
        router.replace('/');
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // 🌟 Gestion des handlers
  const handleUserCreate = async (userData: {
    firstName: string;
    code: string;
    role: 'user' | 'admin';
  }) => {
    try {
      const newUser = await userService.createUser(userData);
      setMessage(`✅ ${newUser.firstName} ajouté`);
    } catch (error) {
      setMessage('❌ Erreur lors de la création de l’utilisateur');
    } finally {
      clearMessageAfterDelay();
    }
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => setMessage(''), 3000);
  };

  // 🌟 Rendu conditionnel
  if (!authorized) {
    return null; // Tu peux aussi afficher un spinner de chargement si tu veux
  }

  // 🌟 Affichage principal
  return (
    <main className="min-h-screen bg-background text-text-primary p-4 flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Panneau Admin 🛠️</h1>
        <p className="text-gray-400 text-sm">Gère les utilisateurs et les bons</p>
      </header>

      {message && (
        <div className="bg-foreground text-center text-green-400 py-2 px-4 rounded-md">
          {message}
        </div>
      )}

      <section className="flex flex-col sm:flex-row gap-4 justify-center ">
        <div className="flex flex-col gap-4 text-center">
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-text-primary px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          ➕ Ajouter un utilisateur
        </button>

        <button
          onClick={openListModal}
          className="bg-gray-600 text-text-primary px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          👥 Voir les utilisateurs
        </button>
        <button
  onClick={openNotifModal}
  className="bg-purple-600 text-text-primary px-4 py-2 rounded-lg hover:bg-purple-700"
>
  📣 Envoyer une notification
</button>
        </div>
        
        
              </section>

      <AddUserModal
        isOpen={isAddOpen}
        isClosing={isAddClosing}
        onClose={closeAddModal}
        onCreate={handleUserCreate}
      />

      <UserListModal
        isOpen={isListOpen}
        isClosing={isListClosing}
        onClose={closeListModal}
      />

      <LogoutButton />
      <SendNotificationModal
  isOpen={isNotifOpen}
  isClosing={isNotifClosing}
  onClose={closeNotifModal}
/>

    </main>
  );
}

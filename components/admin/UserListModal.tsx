'use client';

import { useEffect, useState } from 'react';
import ModalWrapper from '@/components/common/ModalWrapper';
import { userService } from '@/services/userService';
import { UserData } from '@/types/user';
import { useConfirm } from '@/lib/hooks/useConfirm';

type Props = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
};

export default function UserListModal({ isOpen, isClosing, onClose }: Props) {
  // 🔵 États locaux
  const [users, setUsers] = useState<UserData[]>([]); // Liste des utilisateurs
  const [loading, setLoading] = useState(true); // Statut de chargement
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null); // Message de feedback

  const { confirm, ConfirmationModal } = useConfirm(); // Hook pour les confirmations

  // 🔵 Affiche un toast temporaire
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔵 Charge tous les utilisateurs
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
      showToast('error', 'Erreur de chargement ❌');
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Gère la suppression d'un utilisateur après confirmation
  const handleDelete = async (code: string) => {
    const accepted = await confirm({
      title: 'Confirmer la suppression',
      message: 'Veux-tu vraiment supprimer cet utilisateur ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });

    if (!accepted) return;

    try {
      await userService.deleteUser(code);
      setUsers((prev) => prev.filter((u) => u.code !== code)); // Mettre à jour localement la liste
      showToast('success', 'Utilisateur supprimé ✅');
    } catch (err) {
      console.error('Erreur suppression utilisateur', err);
      showToast('error', 'Erreur lors de la suppression ❌');
    }
  };

  // 🔵 Charger les utilisateurs à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // 🔵 Rendu
  return (
    <>
      <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
        {/* Titre */}
        <h2 className="text-xl font-bold mb-4">👥 Utilisateurs</h2>

        {/* Toast de feedback */}
        {toast && (
          <div
            className={`mb-4 px-4 py-2 rounded text-sm transition duration-300 ease-in-out ${
              toast.type === 'success' ? 'bg-green-600 text-text-primary' : 'bg-red-600 text-text-primary'
            } animate-fade-zoom-in`}
          >
            {toast.message}
          </div>
        )}

        {/* Chargement ou liste des utilisateurs */}
        {loading ? (
          <p className="text-text-primary text-sm">Chargement...</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto space-y-2 text-sm">
            {users.length > 0 ? (
              users.map((user) => (
                <li
                  key={user.code}
                  className="flex justify-between items-center p-3 border border-border rounded bg-foreground"
                >
                  {/* Infos utilisateur */}
                  <div className="flex flex-col">
                    <span className="font-medium">{user.firstName}</span>
                    <span className="text-text-secondary text-xs">Code : {user.code}</span>
                    <span className="text-text-secondary text-xs">Rôle : {user.role}</span>
                  </div>

                  {/* Bouton de suppression */}
                  <button
                    onClick={() => handleDelete(user.code)}
                    className="text-red-400 hover:text-red-600 text-xl"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </li>
              ))
            ) : (
              <p className="text-text-secondary text-center">Aucun utilisateur trouvé.</p>
            )}
          </ul>
        )}
      </ModalWrapper>

      {/* Modal de confirmation global */}
      <ConfirmationModal />
    </>
  );
}

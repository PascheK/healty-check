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
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { confirm, ConfirmationModal } = useConfirm();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

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
      setUsers((prev) => prev.filter((u) => u.code !== code));
      showToast('success', 'Utilisateur supprimé ✅');
    } catch (err) {
      console.error('Erreur suppression utilisateur', err);
      showToast('error', 'Erreur lors de la suppression ❌');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  return (
    <>
      <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
        <h2 className="text-xl font-bold mb-4">👥 Utilisateurs</h2>

        {toast && (
          <div
            className={`mb-4 px-4 py-2 rounded text-sm transition duration-300 ease-in-out ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            } animate-fade-zoom-in`}
          >
            {toast.message}
          </div>
        )}

        {loading ? (
          <p className="text-gray-300 text-sm">Chargement...</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto space-y-2 text-sm">
            {users.length > 0 ? (
              users.map((user) => (
                <li
                  key={user.code}
                  className="flex justify-between items-center p-3 border border-gray-600 rounded bg-[#1e1e2e]"
                >
                  {/* Infos utilisateur */}
                  <div className="flex flex-col">
                    <span className="font-medium">{user.firstName}</span>
                    <span className="text-gray-400 text-xs">Code : {user.code}</span>
                    <span className="text-gray-400 text-xs">Rôle : {user.role}</span>
                  </div>

                  {/* Action de suppression */}
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
              <p className="text-gray-400 text-center">Aucun utilisateur trouvé.</p>
            )}
          </ul>
        )}
      </ModalWrapper>

      <ConfirmationModal />
    </>
  );
}

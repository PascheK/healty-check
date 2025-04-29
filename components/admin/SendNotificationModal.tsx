'use client';

import { useEffect, useState } from 'react';
import ModalWrapper from '@/components/common/ModalWrapper';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { UserData } from '@/types/user';

type Props = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
};

export default function SendNotificationModal({ isOpen, isClosing, onClose }: Props) {
  // 🔵 États locaux
  const [users, setUsers] = useState<UserData[]>([]); // Liste des utilisateurs
  const [selectedUserCode, setSelectedUserCode] = useState(''); // Code utilisateur sélectionné
  const [message, setMessage] = useState(''); // Message de la notification
  const [loading, setLoading] = useState(false); // Indicateur d'envoi en cours
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null); // Message de feedback

  // 🔵 Chargement des utilisateurs lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      userService.getAll()
        .then(setUsers)
        .catch(() => setToast({ type: 'error', message: 'Erreur de chargement des utilisateurs' }));
    }
  }, [isOpen]);

  // 🔵 Fonction d'envoi de la notification
  const handleSend = async () => {
    if (!selectedUserCode || !message.trim()) {
      setToast({ type: 'error', message: 'Utilisateur et message obligatoires' });
      return;
    }

    setLoading(true);
    try {
      await notificationService.sendNotification(selectedUserCode, message.trim());
      setToast({ type: 'success', message: 'Notification envoyée ✅' });
      setSelectedUserCode('');
      setMessage('');
    } catch (error) {
      setToast({ type: 'error', message: 'Erreur envoi notification ❌' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000); // Efface le toast après 3 secondes
    }
  };

  // 🔵 Rendu
  return (
    <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      {/* Titre */}
      <h2 className="text-xl font-bold mb-4">📩 Envoyer une notification</h2>

      {/* Toast de feedback */}
      {toast && (
        <div className={`mb-4 p-2 rounded text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Sélection d'un utilisateur */}
        <select
          value={selectedUserCode}
          onChange={(e) => setSelectedUserCode(e.target.value)}
          className="p-2 rounded bg-foreground text-text-primary border border-border"
        >
          <option value="">-- Sélectionner un utilisateur --</option>
          {users.map((user) => (
            <option key={user.code} value={user.code}>
              {user.firstName} {user.lastName || ''} ({user.code})
            </option>
          ))}
        </select>

        {/* Zone de saisie du message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ton message ici..."
          rows={4}
          className="p-2 rounded bg-foreground text-text-primary border border-border resize-none"
        />

        {/* Bouton d'envoi */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-text-primary font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </ModalWrapper>
  );
}

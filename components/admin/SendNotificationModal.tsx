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
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserCode, setSelectedUserCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      userService.getAll()
        .then(setUsers)
        .catch(() => setToast({ type: 'error', message: 'Erreur de chargement des utilisateurs' }));
    }
  }, [isOpen]);

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
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">📩 Envoyer une notification</h2>

      {toast && (
        <div className={`mb-4 p-2 rounded text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Sélection utilisateur */}
        <select
          value={selectedUserCode}
          onChange={(e) => setSelectedUserCode(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white border border-gray-600"
        >
          <option value="">-- Sélectionner un utilisateur --</option>
          {users.map((user) => (
            <option key={user.code} value={user.code}>
              {user.firstName} {user.lastName || ''} ({user.code})
            </option>
          ))}
        </select>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ton message ici..."
          rows={4}
          className="p-2 rounded bg-gray-800 text-white border border-gray-600 resize-none"
        />

        {/* Envoyer */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </ModalWrapper>
  );
}

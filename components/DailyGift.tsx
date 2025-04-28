'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { useConfirm} from '@/lib/hooks/useConfirm';
import { useToast } from '@/lib/hooks/useToast';
import CountdownToGift from './CountdownToGift';

interface DailyGiftProps {
  userId: string;
  onGiftAccepted?: () => void;
}

export default function DailyGift({ userId, onGiftAccepted }: DailyGiftProps) {
  const [pendingGift, setPendingGift] = useState<any>(null);
  const [canReroll, setCanReroll] = useState(true);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmationModal } = useConfirm(); 
  const { showToast } = useToast();
  const [animate, setAnimate] = useState(false);

  const loadGift = async () => {
    try {
      const user = await userService.fetchUser(userId); // On charge directement l'utilisateur
      setPendingGift(user.pendingGift ?? null);
      setCanReroll(user.canRerollToday ?? true);
    } catch (err) {
      console.error('Erreur chargement DailyGift:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptGift = async () => {
    const accepted = await confirm({
      title: 'Stocker ce bon ?',
      message: 'Veux-tu ajouter ce bon dans ton portefeuille ? 🎁',
      confirmText: 'Oui, stocker',
      cancelText: 'Non',
    });
  
    if (!accepted) return;
    try {
      setAnimate(true);
      await userService.acceptGift(userId);
      await userService.syncGiftWallet(userId); // 🔥 Synchroniser après stockage
      
    if (onGiftAccepted) {
      onGiftAccepted(); // 👈 Appelle le callback
    }
      await loadGift();
      showToast('success', 'Bon accepté ✅');
    } catch (err) {
      console.error('Erreur acceptation bon:', err);
      showToast('error', '❌ Erreur lors de l\'acceptation du bon');
 
    }
  };

  const handleRerollGift = async () => {
    try {
      if (!canReroll) {
        showToast('error', '⛔ Vous avez déjà reroll aujourd\'hui.');
        return;
      }

      const accepted = await confirm({
        title: 'Reroll du bon',
        message: 'Veux-tu vraiment reroll ce bon ? (Il sera perdu)',
        confirmText: 'Oui, reroll',
        cancelText: 'Non',
      });
    
      if (!accepted) return;
      await userService.rerollGift(userId);
      await loadGift();
      showToast('success', 'Le bon à bien été reroll ✅');
    } catch (err) {
      console.error('Erreur reroll:', err);
      showToast('error', '❌ Erreur lors du reroll');
    }
  };

  useEffect(() => {
    loadGift();
  }, []);

  if (loading) {
    return <div className="text-center text-text-primary">Chargement du bon du jour...</div>;
  }

  return (
    <>
      <ConfirmationModal />
    <div className="p-4 space-y-4">
      {pendingGift ? (
        <div className={`transition-transform duration-500 ${animate ? 'scale-110 opacity-50' : ''}`}>

        <div className="p-4 rounded-xl shadow-md bg-foreground flex flex-col gap-4 items-center text-center">
          <div className="text-xl font-bold">{pendingGift.giftId.title}</div>
          <div className="text-sm text-text-primary">{pendingGift.giftId.description}</div>
          <div className="text-xs text-text-secondary">Expire le {new Date(pendingGift.expiresAt).toLocaleDateString()}</div>
          <div className='flex gap-4'>
          <button
            onClick={handleAcceptGift}
            className="py-2 px-6 rounded-lg bg-green-500 text-text-primary font-semibold hover:bg-green-600 transition"
          >
            🎁 Stocker
          </button>
          <button
              onClick={handleRerollGift}
              className={`py-2 px-4 rounded-lg ${
                canReroll ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300 cursor-not-allowed'
              } text-text-primary font-semibold transition`}
              disabled={!canReroll}
            >
              🔁 Reroll
            </button>
          </div>
          
        </div>
        </div>
      ) : (
        <CountdownToGift />
      )}
    </div>
    </>
  );
}

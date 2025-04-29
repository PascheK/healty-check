'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useToast } from '@/lib/hooks/useToast';
import CountdownToGift from './CountdownToGift';

interface DailyGiftProps {
  userId: string;
  onGiftAccepted?: () => void; // Callback optionnel après acceptation d'un bon
}

export default function DailyGift({ userId, onGiftAccepted }: DailyGiftProps) {
  // 🔵 États locaux
  const [pendingGift, setPendingGift] = useState<any>(null); // Bon en attente
  const [canReroll, setCanReroll] = useState(true); // Autorisation de reroll aujourd'hui
  const [loading, setLoading] = useState(true); // Statut de chargement
  const [animate, setAnimate] = useState(false); // Animation lors de l'acceptation

  const { confirm, ConfirmationModal } = useConfirm(); 
  const { showToast } = useToast();

  // 🔵 Charger les données du bon actuel
  const loadGift = async () => {
    try {
      const user = await userService.fetchUser(userId);
      setPendingGift(user.pendingGift ?? null);
      setCanReroll(user.canRerollToday ?? true);
    } catch (err) {
      console.error('Erreur chargement DailyGift:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Accepter un bon
  const handleAcceptGift = async () => {
    const accepted = await confirm({
      title: 'Stocker ce bon ?',
      message: 'Veux-tu ajouter ce bon dans ton portefeuille ? 🎁',
      confirmText: 'Oui, stocker',
      cancelText: 'Non',
    });

    if (!accepted) return;

    try {
      setAnimate(true); // Lance une animation visuelle
      await userService.acceptGift(userId);
      await userService.syncGiftWallet(userId); // Synchronisation après acceptation

      if (onGiftAccepted) {
        onGiftAccepted(); // Appelle le callback pour rafraîchir les données
      }
      await loadGift(); // Recharge les données
      showToast('success', 'Bon accepté ✅');
    } catch (err) {
      console.error('Erreur acceptation bon:', err);
      showToast('error', '❌ Erreur lors de l\'acceptation du bon');
    }
  };

  // 🔵 Reroll d'un bon
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
      await loadGift(); // Recharge après reroll
      showToast('success', 'Le bon a bien été reroll ✅');
    } catch (err) {
      console.error('Erreur reroll:', err);
      showToast('error', '❌ Erreur lors du reroll');
    }
  };

  // 🔵 Charger à l'initialisation du composant
  useEffect(() => {
    loadGift();
  }, []);

  // 🔵 Affichage pendant le chargement
  if (loading) {
    return <div className="text-center text-text-primary">Chargement du bon du jour...</div>;
  }

  // 🔵 Rendu final
  return (
    <>
      <ConfirmationModal />
      <div className="p-4 space-y-4">
        {pendingGift ? (
          <div className={`transition-transform duration-500 ${animate ? 'scale-110 opacity-50' : ''}`}>
            <div className="p-4 rounded-xl shadow-md bg-foreground flex flex-col gap-4 items-center text-center">
              {/* Informations sur le bon */}
              <div className="text-xl font-bold">{pendingGift.giftId.title}</div>
              <div className="text-sm text-text-primary">{pendingGift.giftId.description}</div>
              <div className="text-xs text-text-secondary">
                Expire le {new Date(pendingGift.expiresAt).toLocaleDateString()}
              </div>

              {/* Boutons d'actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAcceptGift}
                  className="py-2 px-6 rounded-lg bg-green-500 text-text-primary font-semibold hover:bg-green-600 transition"
                >
                  🎁 Stocker
                </button>
                <button
                  onClick={handleRerollGift}
                  disabled={!canReroll}
                  className={`py-2 px-4 rounded-lg text-text-primary font-semibold transition ${
                    canReroll
                      ? 'bg-yellow-400 hover:bg-yellow-500'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  🔁 Reroll
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Pas de bon en attente → compte à rebours
          <CountdownToGift />
        )}
      </div>
    </>
  );
}

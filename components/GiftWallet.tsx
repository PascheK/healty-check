'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { GiftWallet as GiftWalletType } from '@/types/gift';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useToast } from '@/lib/hooks/useToast';
import { ChevronDown } from 'lucide-react';

interface GiftWalletProps {
  userId: string;
  refreshFlag?: number; // Utilisé pour forcer le rechargement
}

export default function GiftWallet({ userId, refreshFlag }: GiftWalletProps) {
  // 🔵 États locaux
  const [wallet, setWallet] = useState<GiftWalletType | null>(null);
  const { confirm, ConfirmationModal } = useConfirm();
  const { showToast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [usedGiftId, setUsedGiftId] = useState<string | null>(null);

  // 🔵 Chargement du portefeuille
  useEffect(() => {
    async function loadWallet() {
      try {
        const local = await userService.getGiftWalletLocal();
        const data = local ?? await userService.syncGiftWallet(userId);

        // 🎯 Trier l'historique par date décroissante
        data.usedGifts.sort((a, b) => new Date(b.usedAt!).getTime() - new Date(a.usedAt!).getTime());

        setWallet(data);
      } catch (err) {
        console.error('Erreur lors du chargement du portefeuille :', err);
      }
    }
    loadWallet();
  }, [userId, refreshFlag]);

  // 🔵 Utiliser un bon
  const useGift = async (giftEntryId: string) => {
    const accepted = await confirm({
      title: 'Utiliser ce bon ?',
      message: 'Es-tu sûr de vouloir utiliser ce bon maintenant ?',
      confirmText: 'Oui, utiliser',
      cancelText: 'Annuler',
    });

    if (!accepted) return;

    try {
      setUsedGiftId(giftEntryId); // Démarrer une animation éventuelle
      await userService.useGift(userId, giftEntryId);

      const updatedWallet = await userService.getGiftWalletLocal();
      setWallet(updatedWallet);

      showToast('success', 'Le bon a bien été utilisé ✅');
    } catch (err) {
      console.error('Erreur lors de l\'utilisation du bon :', err);
      showToast('error', '❌ Erreur lors de l\'utilisation du bon');
    }
  };

  // 🔵 Rendu
  return (
    <>
      <ConfirmationModal />

      <div className="p-4 space-y-8">
        {/* Section Bons disponibles */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🎁 Bons Disponibles</h2>

          <div className="space-y-4">
            {wallet?.availableGifts.length ? (
              wallet.availableGifts.map((gift) => (
                <div
                  key={gift._id}
                  className={`p-4 rounded-xl shadow-md transition-all duration-500 bg-foreground flex flex-col gap-2 ${
                    usedGiftId === gift._id ? 'opacity-0 scale-95' : ''
                  }`}
                >
                  <div className="text-lg font-semibold">{gift.giftId.title}</div>
                  <div className="text-sm text-text-primary">{gift.giftId.description}</div>
                  <div className="text-xs text-text-secondary">
                    Expire le {new Date(gift.expiresAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => useGift(gift._id)}
                    className="mt-2 py-2 px-4 rounded-lg bg-green-500 text-text-primary text-sm font-medium hover:bg-green-600 transition"
                  >
                    Utiliser ce bon
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucun bon disponible actuellement.</p>
            )}
          </div>
        </section>

        {/* Section Historique */}
        <section>
          <div
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setShowHistory(prev => !prev)}
          >
            <h2 className="text-2xl font-bold">📜 Historique</h2>
            <ChevronDown
              className={`h-6 w-6 text-primary-light dark:text-primary-dark transform transition-transform duration-300 ${
                showHistory ? 'rotate-180' : ''
              }`}
            />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              showHistory ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            <div className="space-y-4 mt-4">
              {wallet?.usedGifts.length ? (
                wallet.usedGifts.slice(0, 5).map((gift) => (
                  <div
                    key={gift._id}
                    className="p-4 rounded-xl shadow-inner bg-foreground flex flex-col gap-2"
                  >
                    <div className="text-lg font-semibold">{gift.giftId.title}</div>
                    <div className="text-xs text-text-secondary">
                      Utilisé le {new Date(gift.usedAt || '').toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary">Aucun bon utilisé pour le moment.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function useBonBienEtre(userCode: string | null, secret: string, intervalHours = 12) {
  const [bonsDispo, setBonsDispo] = useState<{ id: number; texte: string }[]>([]);
  const [bon, setBon] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [historique, setHistorique] = useState<string[]>([]);
  const [bonUtilise, setBonUtilise] = useState<boolean>(false);

  const interval = intervalHours * 60 * 60 * 1000;
  const now = Date.now();

  const bonKey = `bon-${userCode}`;
  const timeKey = `${bonKey}-time`;
  const usedKey = `${bonKey}-used`;
  const historyKey = `${bonKey}-history`;

  useEffect(() => {
    if (!userCode) return;

    fetch('/api/bons', {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    })
      .then((res) => res.json())
      .then((bons) => setBonsDispo(bons));
  }, [userCode, secret]);

  useEffect(() => {
    if (!userCode || bonsDispo.length === 0) return;

    const savedBon = localStorage.getItem(bonKey);
    const savedTime = Number(localStorage.getItem(timeKey));
    const isUsed = localStorage.getItem(usedKey) === 'true';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

    const elapsed = now - savedTime;

    if (savedBon && elapsed < interval) {
      setBon(savedBon);
      setCooldown(interval - elapsed);
      setBonUtilise(isUsed);
    } else {
      tirerNouveauBon();
    }

    setHistorique(history);
  }, [bonsDispo]);

  const tirerNouveauBon = () => {
    if (bonsDispo.length === 0 || !userCode) return;
    const nouveau = bonsDispo[Math.floor(Math.random() * bonsDispo.length)];
    setBon(nouveau.texte);
    setCooldown(interval);
    setBonUtilise(false);
    localStorage.setItem(bonKey, nouveau.texte);
    localStorage.setItem(timeKey, Date.now().toString());
    localStorage.setItem(usedKey, 'false');


      // ➕ Notification native
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎁 Nouveau bon bien-être disponible !', {
          body: `"${nouveau.texte}" est maintenant disponible`,
          icon: '/public/icon-192x192.png',
        });
      }
  
    
  };

  const utiliserBon = () => {
    if (!bon || !userCode) return;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const updatedHistory = [...history, bon];

    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    localStorage.setItem(usedKey, 'true');

    setHistorique(updatedHistory);
    setBonUtilise(true);
  };

  return {
    bon,
    cooldown,
    bonUtilise,
    utiliserBon,
    tirerNouveauBon,
    historique,
  };
}

'use client';

import { useEffect, useState } from 'react';

export default function CountdownToGift() {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const calculateTimeLeft = () => {
    const now = new Date();
    const noonToday = new Date();
    noonToday.setHours(12, 0, 0, 0);

    // Si on est après 12h00 aujourd'hui ➔ viser 12h demain
    if (now > noonToday) {
      noonToday.setDate(noonToday.getDate() + 1);
    }

    const diff = noonToday.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mt-6 text-sm text-text-secondary">
      🎁 Prochain bon disponible dans : <span className="font-semibold">{timeLeft}</span>
    </div>
  );
}

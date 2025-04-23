'use client';

import { useEffect, useState } from 'react';

type Props = {
  show: boolean;
  onClose: () => void;
};

export default function OptionsMenu({ show, onClose }: Props) {
  const [notificationsOn, setNotificationsOn] = useState<boolean>(false);
  const [rappelsOn, setRappelsOn] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationsOn(localStorage.getItem('notificationsOn') === 'true');
      setRappelsOn(localStorage.getItem('rappelsOn') === 'true');
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationsOn', notificationsOn.toString());
    }
  }, [notificationsOn]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rappelsOn', rappelsOn.toString());
    }
  }, [rappelsOn]);
  
  
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const citations = [
    "Un petit pas aujourd’hui, c’est déjà un pas de plus qu’hier.",
    "Sois doux avec toi-même, tu fais de ton mieux.",
    "Respire. Tu n’as pas besoin de tout contrôler.",
    "Tu avances, même quand tu as l’impression de stagner."
  ];

  const demanderPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotificationsOn(true);
        }
      });
    }
  };

  const startRappels = () => {
    const id = setInterval(() => {
      if (Notification.permission === 'granted') {
        const citation = citations[Math.floor(Math.random() * citations.length)];
        new Notification('💬 Rappel bien-être', {
          body: citation,
          icon: '/public/icon-192x192.png'
        });
      }
    }, 1000 * 10); // toutes les 30 minutes
    setIntervalId(id);
  };

  const stopRappels = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  useEffect(() => {
    if (rappelsOn) {
      startRappels();
    } else {
      stopRappels();
    }
    return () => stopRappels();
  }, [rappelsOn]);

  return (
    <div
    className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white shadow-lg z-40 transition-transform duration-300 transform ${
      show ? 'translate-x-0' : 'translate-x-full'
    }`}
    >
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">⚙️ Options</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span>Notifications système</span>
          <button
            onClick={demanderPermission}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
          >
            Activer
          </button>
        </div>

        <div className="flex justify-between items-center">
          <span>Rappels de citations</span>
          <button
            onClick={() => setRappelsOn(!rappelsOn)}
            className={`px-2 py-1 text-xs rounded ${
              rappelsOn ? 'bg-green-500' : 'bg-gray-600'
            } text-white`}
          >
            {rappelsOn ? 'Activé' : 'Désactivé'}
          </button>
        </div>
      </div>
    </div>
  );
}

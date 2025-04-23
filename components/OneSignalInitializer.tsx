'use client';

import { useEffect } from 'react';

export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'OneSignal' in window) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.OneSignal = window.OneSignal || [];
      // @ts-ignore
      OneSignal.push(function () {
        OneSignal.init({
          appId: '5930bdec-10ac-416c-ae20-727911370b75', // 🔁 Remplace ici
          safari_web_id: '', // Laisse vide si pas utilisé
          notifyButton: {
            enable: true,
          },
        });
      });
    };
  }, []);

  return null;
}

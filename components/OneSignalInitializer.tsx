'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignal: any;
  }
}

export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(async function () {
        try {
          await window.OneSignal.init({
            appId: '5930bdec-10ac-416c-ae20-727911370b75',
            notifyButton: {
              enable: true,
            },
          });
          console.log('✅ OneSignal initialized');
        } catch (error) {
          console.error('❌ Erreur OneSignal init :', error);
        }
      });
    };
  }, []);

  return null;
}

import { PushSubscription } from '@/types/notification';
import { generateUniqueId } from '@/utils/generateUniqueId';
import { authService } from './authService';

const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;

const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.register('/service-worker.js');
  } else {
    throw new Error('Service Worker non supporté');
  }
};

const requestNotificationPermission = async (): Promise<boolean> => {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};
const subscribeToPushNotifications = async (forcedUserId?: string): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await registerServiceWorker();

    let userId = forcedUserId;

    if (!userId) {
      const connectedUser = authService.getUser();
      if (connectedUser) {
        userId = connectedUser.code;
      } else {
        userId = localStorage.getItem('userId') ?? undefined;
      }

      if (!userId) {
        userId = `${generateUniqueId()}`;
        localStorage.setItem('userId', userId);
      }
    }

    const subscriptionRaw = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
    });

    const pushSubscription: PushSubscription = {
      endpoint: subscriptionRaw.endpoint,
      keys: {
        p256dh: subscriptionRaw.toJSON().keys?.p256dh ?? '',
        auth: subscriptionRaw.toJSON().keys?.auth ?? '',
      },
    };

    localStorage.setItem('pushSubscription', JSON.stringify(pushSubscription));

    await sendSubscriptionToBackend(userId, pushSubscription);
  }
};


const sendSubscriptionToBackend = async (userId: string, subscription: PushSubscription): Promise<void> => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, subscription }),
  });
};

// Utile pour convertir la clé VAPID
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

export const notificationService = {
  requestNotificationPermission,
  subscribeToPushNotifications,
};

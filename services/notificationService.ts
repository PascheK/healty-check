import { PushSubscription } from '@/types/notification';
import { generateUniqueId } from '@/utils/generateUniqueId';
import { authService } from './authService';
import { storageService } from './storageService';

// 🔵 Clé publique pour VAPID
const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;

// 🔵 1. Enregistrement du Service Worker
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.register('/service-worker.js');
  } else {
    throw new Error('Service Worker non supporté par ce navigateur.');
  }
};

// 🔵 2. Demander l'autorisation de notifications
const requestNotificationPermission = async (): Promise<boolean> => {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// 🔵 3. Vérifier si l'utilisateur est déjà abonné
const alreadySubscribed = async (): Promise<boolean> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
};

// 🔵 4. Souscrire aux notifications Push
const subscribeToPushNotifications = async (forcedUserId?: string): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  console.log('📡 Tentative d’inscription aux notifications');

  const registration = await navigator.serviceWorker.ready;
  console.log('✅ Service Worker prêt');

  let userId = forcedUserId;

  if (!userId) {
    const connectedUser = await authService.getUser();
    if (connectedUser) {
      userId = connectedUser.code;
    } else {
      userId = await storageService.getItem('userId') || undefined;
    }

    if (!userId) {
      userId = `anon-${generateUniqueId()}`;
      await storageService.setItem('userId', userId);
    }
  }

  console.log('📋 Utilisation de l\'userId pour l’abonnement:', userId);

  const subscriptionRaw = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
  });

  console.log('✅ Subscription créée:', subscriptionRaw);

  const pushSubscription: PushSubscription = {
    endpoint: subscriptionRaw.endpoint,
    keys: {
      p256dh: subscriptionRaw.toJSON().keys?.p256dh ?? '',
      auth: subscriptionRaw.toJSON().keys?.auth ?? '',
    },
  };

  await storageService.setItem('pushSubscription', pushSubscription);

  console.log('📤 Envoi de l\'abonnement au backend:', { userId, pushSubscription });

  await sendSubscriptionToBackend(userId, pushSubscription);

  console.log('🎉 Inscription terminée pour:', userId);
};

// 🔵 5. Envoi de la souscription au backend
const sendSubscriptionToBackend = async (userId: string, subscription: PushSubscription): Promise<void> => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, subscription }),
  });
};

// 🔵 6. Utilitaire de conversion VAPID clé (base64 -> Uint8Array)
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

// 🔵 7. Envoyer une notification depuis l'admin
const sendNotification = async (userCode: string, message: string) => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/send-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userCode, message }),
  });
};

// 🎯 Service final exporté
export const notificationService = {
  requestNotificationPermission,
  registerServiceWorker,
  alreadySubscribed,
  subscribeToPushNotifications,
  sendSubscriptionToBackend,
  sendNotification,
};

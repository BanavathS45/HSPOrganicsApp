// HSP Organics — Firebase Cloud Messaging (FCM) Push Notification Module
// Handles: token registration, foreground message display, token persistence to Firestore

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, isMock } from './config';

// ── VAPID Key ──────────────────────────────────────────────────────────────
// Get this from: Firebase Console → Project Settings → Cloud Messaging →
// Web Push Certificates → Generate Key Pair → copy the "Key pair" value
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let messaging = null;

// Only initialize messaging in a real Firebase environment
if (!isMock && typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn('[HSP FCM] Failed to initialize messaging:', e.message);
  }
}

// ── Register FCM Token ─────────────────────────────────────────────────────
// Call this after the user logs in. It registers the browser for push
// notifications and saves the token to Firestore under /fcmTokens/{uid}.
export const registerFCMToken = async (userId) => {
  if (!messaging || !userId) return null;
  if (!VAPID_KEY) {
    console.warn('[HSP FCM] VITE_FIREBASE_VAPID_KEY not set — FCM token registration skipped.');
    return null;
  }

  try {
    // Ensure the service worker is registered
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[HSP FCM] Notification permission denied.');
      return null;
    }

    // Get the FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[HSP FCM] ✅ Token registered:', token.substring(0, 20) + '...');

      // Persist the token in Firestore so admin can target specific users
      if (db) {
        await setDoc(doc(db, 'fcmTokens', userId), {
          token,
          userId,
          updatedAt: serverTimestamp(),
          userAgent: navigator.userAgent.substring(0, 100)
        }, { merge: true });
      }

      return token;
    }
  } catch (err) {
    console.error('[HSP FCM] Token registration failed:', err.message);
  }
  return null;
};

// ── Foreground Message Handler ─────────────────────────────────────────────
// When the app is OPEN and a push arrives, the service worker won't show the
// notification automatically. We handle it here and show a browser Notification
// plus dispatch a DOM event so the in-app toast can also appear.
export const initForegroundMessaging = (onNotificationReceived) => {
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('[HSP FCM] Foreground message received:', payload);

    const { title, body } = payload.notification || {};
    const notifTitle = title || 'HSP Organics 🌿';
    const notifBody = body || 'You have a new update.';

    // Show browser native notification even when app is in foreground
    if (Notification.permission === 'granted') {
      new Notification(notifTitle, {
        body: notifBody,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'hsp-foreground',
        renotify: true,
      });
    }

    // Dispatch in-app toast event (picked up by AppContext)
    const event = new CustomEvent('hsp_fcm_notification', {
      detail: {
        title: notifTitle,
        body: notifBody,
        type: payload.data?.type || 'general',
        userId: payload.data?.userId || 'all',
        createdAt: Date.now()
      }
    });
    window.dispatchEvent(event);

    // Also call optional callback
    if (typeof onNotificationReceived === 'function') {
      onNotificationReceived(payload);
    }
  });

  return unsubscribe;
};

// ── Trigger In-App Notification (Firestore-only path) ──────────────────────
// When there's no VAPID key set up, we fall back to this Firestore-based
// approach which shows the in-app toast for all active browser sessions.
export const sendInAppNotification = (notification) => {
  const event = new CustomEvent('hsp_fcm_notification', { detail: notification });
  window.dispatchEvent(event);
};

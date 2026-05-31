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

// ── Validate VAPID key format ───────────────────────────────────────────────
// VAPID keys must be URL-safe Base64, 65 bytes uncompressed = 87 base64 chars (no padding)
const isValidVapidKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  // URL-safe Base64 without padding: 87 or 88 chars
  const stripped = key.replace(/=/g, '');
  return /^[A-Za-z0-9_-]{86,88}$/.test(stripped);
};

// ── Register FCM Token ─────────────────────────────────────────────────────
// Call this after the user logs in. It registers the browser for push
// notifications and saves the token to Firestore under /fcmTokens/{uid}.
export const registerFCMToken = async (userId) => {
  if (!messaging || !userId) return null;

  if (!isValidVapidKey(VAPID_KEY)) {
    console.warn(
      '[HSP FCM] VAPID key is missing or invalid. ' +
      'Go to Firebase Console → Project Settings → Cloud Messaging → ' +
      'Web Push Certificates → copy the key and set VITE_FIREBASE_VAPID_KEY in .env\n' +
      'In-app Firestore notifications will still work without FCM.'
    );
    return null;
  }

  try {
    // Wait for the service worker to be ready (avoids race conditions on first load)
    const registration = await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[HSP FCM] Notification permission denied — in-app toasts still active.');
      return null;
    }

    // Get the FCM device token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[HSP FCM] ✅ FCM Token registered:', token.substring(0, 20) + '...');

      // Persist token in Firestore for server-side targeting
      if (db) {
        try {
          await setDoc(doc(db, 'fcmTokens', userId), {
            token,
            userId,
            updatedAt: serverTimestamp(),
            userAgent: navigator.userAgent.substring(0, 100)
          }, { merge: true });
        } catch (dbErr) {
          // Non-fatal — token is still valid for this session even if storage fails
          console.warn('[HSP FCM] Could not persist token to Firestore:', dbErr.message);
        }
      }

      return token;
    }
  } catch (err) {
    // Don't crash the app — fall back to Firestore-only in-app notifications
    if (err.message?.includes('applicationServerKey') || err.message?.includes('subscribe')) {
      console.warn(
        '[HSP FCM] PushManager subscription failed — VAPID key may be from the wrong Firebase project. ' +
        'In-app Firestore notifications will still work.'
      );
    } else {
      console.warn('[HSP FCM] Token registration failed (non-fatal):', err.message);
    }
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

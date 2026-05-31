// ─────────────────────────────────────────────────────────────────────────────
// HSP Organics — Firebase Cloud Messaging Service Worker
// Handles: Background & closed-app push notifications
// Location: /public/firebase-messaging-sw.js  (must stay at root URL path)
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE WORKER LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[HSP SW] Installing v3.0 — skip waiting immediately');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[HSP SW] Activated — claiming all clients');
  event.waitUntil(
    (async () => {
      // Clear all old caches on SW update
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      // Take control of all pages immediately
      await clients.claim();
    })()
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

firebase.initializeApp({
  apiKey: "AIzaSyCySJZVXjFZAz0zZKbJJOCGZxAzj3YaKoM",
  authDomain: "hello-ba4d8.firebaseapp.com",
  projectId: "hello-ba4d8",
  storageBucket: "hello-ba4d8.firebasestorage.app",
  messagingSenderId: "624479374374",
  appId: "1:624479374374:web:ba149c8333a143933e6ae7"
});

const messaging = firebase.messaging();

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND MESSAGE HANDLER (App open in another tab / minimized)
// This fires when FCM sends a data-only message while the app tab exists
// but is NOT focused. Firebase SDK calls this automatically.
// ─────────────────────────────────────────────────────────────────────────────

messaging.onBackgroundMessage((payload) => {
  console.log('[HSP SW] Background FCM message received:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'HSP Organics 🌿';
  const body  = notification.body  || data.body  || 'You have a new update!';
  const icon  = notification.icon  || '/pwa-192x192.png';
  const url   = data.url || '/';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/pwa-192x192.png',
    image: notification.image || undefined,
    data: { url },
    tag: data.tag || 'hsp-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: 'open',    title: '🛒 Open App' },
      { action: 'dismiss', title: '❌ Dismiss'  }
    ]
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RAW PUSH EVENT (Fallback — App fully closed / killed)
// When the app is completely closed, Firebase SDK may not be active.
// This raw push listener catches the notification payload directly from
// the browser's Push API and shows it via showNotification().
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  console.log('[HSP SW] Raw push event received (app may be closed)');

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    console.warn('[HSP SW] Could not parse push payload as JSON:', err);
    try {
      payload = { notification: { title: 'HSP Organics 🌿', body: event.data?.text() || 'You have a new update!' } };
    } catch (_) {}
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'HSP Organics 🌿';
  const body  = notification.body  || data.body  || 'You have a new update from HSP Organics.';
  const icon  = notification.icon  || '/pwa-192x192.png';
  const url   = data.url || '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/pwa-192x192.png',
      data: { url },
      tag: 'hsp-push-notification',
      renotify: true,
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,  // stays on screen until user interacts
      actions: [
        { action: 'open',    title: '🛒 Open App' },
        { action: 'dismiss', title: '❌ Dismiss'  }
      ]
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CLICK HANDLER
// Routes the user to the correct page when they tap the notification.
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  console.log('[HSP SW] Notification clicked — action:', event.action);
  event.notification.close();

  // If user tapped Dismiss, do nothing
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open somewhere, focus and navigate it
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + targetUrl);
      }
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PUSH SUBSCRIPTION CHANGE
// Re-subscribe if the browser invalidates the push subscription.
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[HSP SW] Push subscription changed — resubscribing');
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        console.log('[HSP SW] Resubscribed:', subscription.endpoint);
      })
  );
});
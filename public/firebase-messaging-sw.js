// // HSP Organics — Firebase Cloud Messaging Service Worker
// // This file MUST be at /public/firebase-messaging-sw.js so the browser can register it.
// // It handles background push notifications when the app is closed or in another tab.

// importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// // Firebase config is injected at runtime via the message channel below,
// // but we also hard-code a minimal config here for background message handling.
// // These are PUBLIC keys — safe to include in the service worker.
// firebase.initializeApp({
//   apiKey: "AIzaSyCySJZVXjFZAz0zZKbJJOCGZxAzj3YaKoM",
//   authDomain: "hello-ba4d8.firebaseapp.com",
//   projectId: "hello-ba4d8",
//   storageBucket: "hello-ba4d8.firebasestorage.app",
//   messagingSenderId: "624479374374",
//   appId: "1:624479374374:web:ba149c8333a143933e6ae7"
// });

// const messaging = firebase.messaging();

// // ── Background message handler ─────────────────────────────────────────────
// // Fires when a push notification arrives while the app is in the BACKGROUND
// // (minimized, another tab active, or browser closed).
// messaging.onBackgroundMessage((payload) => {
//   console.log('[HSP SW] Background push received:', payload);

//   const { title, body, icon, image, data } = payload.notification || payload.data || {};

//   const notificationTitle = title || 'HSP Organics 🌿';
//   const notificationOptions = {
//     body: body || 'You have a new update from HSP Organics.',
//     icon: icon || '/pwa-192x192.png',
//     badge: '/pwa-192x192.png',
//     image: image || undefined,
//     data: data || {},
//     tag: 'hsp-notification',          // replaces older notifications of same tag
//     renotify: true,
//     vibrate: [200, 100, 200],
//     actions: [
//       { action: 'open', title: '🛒 Open App' },
//       { action: 'dismiss', title: 'Dismiss' }
//     ]
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// // ── Notification click handler ─────────────────────────────────────────────
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();

//   if (event.action === 'dismiss') return;

//   // Focus the existing HSP tab or open a new one
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//       for (const client of clientList) {
//         if (client.url.includes(self.location.origin) && 'focus' in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow('/');
//       }
//     })
//   );
// });
// public/firebase-messaging-sw.js

// ─────────────────────────────────────────────────────────────
// HSP Organics - Firebase Messaging Service Worker
// This file MUST stay inside /public folder
// Example: /public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────

// Firebase SDKs
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─────────────────────────────────────────────────────────────
// FORCE NEW SERVICE WORKER UPDATE
// Prevent old cached UI issue in Netlify/PWA
// ─────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');

  event.waitUntil(
    (async () => {
      // Remove old caches
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache);
        })
      );

      // Take control immediately
      await clients.claim();
    })()
  );
});

// ─────────────────────────────────────────────────────────────
// FIREBASE CONFIG
// ─────────────────────────────────────────────────────────────

firebase.initializeApp({
  apiKey: "AIzaSyCySJZVXjFZAz0zZKbJJOCGZxAzj3YaKoM",
  authDomain: "hello-ba4d8.firebaseapp.com",
  projectId: "hello-ba4d8",
  storageBucket: "hello-ba4d8.firebasestorage.app",
  messagingSenderId: "624479374374",
  appId: "1:624479374374:web:ba149c8333a143933e6ae7"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// ─────────────────────────────────────────────────────────────
// BACKGROUND PUSH NOTIFICATION
// ─────────────────────────────────────────────────────────────

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background Message:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle =
    notification.title ||
    data.title ||
    'HSP Organics 🌿';

  const notificationOptions = {
    body:
      notification.body ||
      data.body ||
      'You have a new notification.',

    icon:
      notification.icon ||
      '/pwa-192x192.png',

    badge:
      '/pwa-192x192.png',

    image:
      notification.image ||
      data.image ||
      undefined,

    data: {
      url: data.url || '/',
    },

    tag: 'hsp-organics-notification',

    renotify: true,

    vibrate: [200, 100, 200],

    requireInteraction: false,

    actions: [
      {
        action: 'open',
        title: '🛒 Open App',
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
      },
    ],
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// ─────────────────────────────────────────────────────────────
// NOTIFICATION CLICK EVENT
// ─────────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification Clicked');

  event.notification.close();

  // If dismiss button clicked
  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl =
    event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {

      // Focus existing tab if app already opened
      for (const client of clientList) {
        if (
          client.url.includes(self.location.origin) &&
          'focus' in client
        ) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
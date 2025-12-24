// Service Worker pour les notifications push
const CACHE_NAME = 'kbv-cache-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(clients.claim());
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Notification push reçue:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('Données de la notification:', data);

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: data.tag || 'kbv-notification'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);

  event.notification.close();

  // Action par défaut : ouvrir l'app
  if (event.action === '' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  // Autres actions possibles selon les besoins
});

// Cache des ressources statiques
self.addEventListener('fetch', (event) => {
  // Pour l'instant, pas de cache agressif
  // On pourrait ajouter du cache pour les ressources statiques plus tard
});

// Gestionnaire de notifications push pour PWA
export class NotificationManager {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        // Enregistrer le Service Worker
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré:', this.serviceWorkerRegistration);
      } catch (error) {
        console.error('Erreur enregistrement Service Worker:', error);
      }
    } else {
      console.warn('Notifications non supportées sur ce navigateur');
    }
  }

  // Demander la permission de notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications non supportées');
    }

    const permission = await Notification.requestPermission();
    console.log('Permission de notification:', permission);
    return permission;
  }

  // Vérifier si les notifications sont autorisées
  isPermissionGranted(): boolean {
    return Notification.permission === 'granted';
  }

  // Programmer une notification pour une visite
  async scheduleVisitNotification(visit: any, daysBefore: number = 1) {
    if (!this.isPermissionGranted() || !this.serviceWorkerRegistration) {
      console.warn('Notifications non autorisées ou Service Worker non disponible');
      return;
    }

    const visitDate = new Date(visit.date);
    const notificationDate = new Date(visitDate);
    notificationDate.setDate(visitDate.getDate() - daysBefore);

    // Ne programmer que si la date est dans le futur
    if (notificationDate <= new Date()) {
      return;
    }

    const delay = notificationDate.getTime() - Date.now();

    // Pour une vraie implémentation, on utiliserait une API comme Background Sync
    // ou un système de planification côté serveur. Ici on utilise setTimeout pour la démo.
    setTimeout(() => {
      this.showVisitNotification(visit, daysBefore);
    }, Math.min(delay, 10000)); // Limite pour la démo (10 secondes max)

    console.log(`Notification programmée pour ${notificationDate.toLocaleString()} (${daysBefore} jour(s) avant)`);
  }

  // Afficher une notification de visite
  async showVisitNotification(visit: any, daysBefore: number) {
    if (!this.isPermissionGranted() || !this.serviceWorkerRegistration) {
      return;
    }

    let title = 'Rappel de visite';
    let body = '';

    if (daysBefore === 0) {
      title = `Visite aujourd'hui : ${visit.speakerName}`;
      body = `À ${visit.time} - ${visit.congregation}`;
    } else if (daysBefore === 1) {
      title = `Visite demain : ${visit.speakerName}`;
      body = `À ${visit.time} - ${visit.congregation}`;
    } else {
      title = `Visite dans ${daysBefore} jours : ${visit.speakerName}`;
      body = `${new Date(visit.date).toLocaleDateString('fr-FR')} à ${visit.time}`;
    }

    const notificationData = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        visitId: visit.id,
        action: 'view_visit'
      },
      tag: `visit-${visit.id}-${daysBefore}`,
      requireInteraction: false
    };

    try {
      // Utiliser l'API Push si disponible, sinon fallback sur showNotification direct
      if ('pushManager' in this.serviceWorkerRegistration) {
        // Pour une vraie implémentation PWA, on utiliserait pushManager.subscribe()
        // Ici on utilise directement showNotification pour la démo
        await this.serviceWorkerRegistration.showNotification(title, {
          body: notificationData.body,
          icon: notificationData.icon,
          badge: notificationData.badge,
          data: notificationData.data,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction
        } as NotificationOptions);
      }
    } catch (error) {
      console.error('Erreur affichage notification:', error);
    }
  }

  // Programmer des notifications pour toutes les visites à venir
  async scheduleAllUpcomingVisits(visits: any[]) {
    if (!this.isPermissionGranted()) {
      console.log('Notifications non autorisées - pas de programmation');
      return;
    }

    const today = new Date();
    const futureVisits = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      return visitDate > today && visit.status !== 'Cancelled';
    });

    console.log(`Programmation de ${futureVisits.length} notifications pour visites futures`);

    for (const visit of futureVisits) {
      // Notification 2 jours avant
      await this.scheduleVisitNotification(visit, 2);
      // Notification 1 jour avant
      await this.scheduleVisitNotification(visit, 1);
      // Notification le jour même
      await this.scheduleVisitNotification(visit, 0);
    }
  }

  // Annuler toutes les notifications programmées
  async cancelAllNotifications() {
    if (!this.serviceWorkerRegistration) return;

    const notifications = await this.serviceWorkerRegistration.getNotifications();
    for (const notification of notifications) {
      notification.close();
    }

    console.log('Toutes les notifications annulées');
  }

  // Tester les notifications (pour développement)
  async testNotification() {
    if (!this.isPermissionGranted()) {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission refusée');
      }
    }

    await this.showVisitNotification({
      id: 'test-visit',
      speakerName: 'Test Orateur',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      congregation: 'Test Congrégation'
    }, 0);

    console.log('Notification de test envoyée');
  }
}

// Instance globale
export const notificationManager = new NotificationManager();

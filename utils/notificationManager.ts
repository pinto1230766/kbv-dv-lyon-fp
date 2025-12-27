import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { Visit } from '../types';

// Gestionnaire de notifications natives pour Android via Capacitor
export class NotificationManager {
  private hasPermission: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Ne pas initialiser les notifications natives sur le Web
    if (!Capacitor.isNativePlatform()) {
      console.log('ℹ️ Notifications natives désactivées (Plateforme Web)');
      return;
    }

    try {
      // Vérifier et demander les permissions
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display === 'granted') {
        this.hasPermission = true;
        console.log('✅ Permissions notifications accordées');
      } else {
        console.log('⚠️ Permissions notifications non accordées');
      }

      // Créer le canal de notification pour Android
      await this.createNotificationChannel();
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
    }
  }

  // Créer un canal de notification (requis pour Android 8+)
  private async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'visits',
        name: 'Rappels de visites',
        description: 'Notifications pour les visites d\'orateurs',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#e64c19'
      });
      console.log('✅ Canal de notification créé');
    } catch (error) {
      console.error('❌ Erreur création canal:', error);
    }
  }

  // Demander la permission de notifications
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      this.hasPermission = permission.display === 'granted';
      
      if (this.hasPermission) {
        console.log('✅ Permission accordée');
        await this.createNotificationChannel();
      } else {
        console.log('❌ Permission refusée');
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('❌ Erreur demande permission:', error);
      return false;
    }
  }

  // Vérifier si les notifications sont autorisées
  async isPermissionGranted(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.checkPermissions();
      this.hasPermission = permission.display === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  }

  // Programmer une notification pour une visite
  async scheduleVisitNotification(visit: Visit, daysBefore: number = 1): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const hasPermission = await this.isPermissionGranted();
    
    if (!hasPermission) {
      console.warn('⚠️ Notifications non autorisées');
      return;
    }

    try {
      const visitDate = new Date(visit.date + 'T' + (visit.time || '14:30'));
      const notificationDate = new Date(visitDate);
      notificationDate.setDate(visitDate.getDate() - daysBefore);
      notificationDate.setHours(9, 0, 0, 0); // 9h le matin

      // Ne programmer que si la date est dans le futur
      if (notificationDate <= new Date()) {
        console.log(`⏭️ Date passée, notification ignorée`);
        return;
      }

      // Créer le titre et le corps de la notification
      let title = 'Rappel de visite';
      let body = '';

      if (daysBefore === 0) {
        title = `🔔 Visite aujourd'hui !`;
        body = `${visit.speakerName} à ${visit.time}\n${visit.congregation}`;
      } else if (daysBefore === 1) {
        title = `📅 Visite demain`;
        body = `${visit.speakerName} à ${visit.time}\n${visit.congregation}`;
      } else {
        title = `📆 Visite dans ${daysBefore} jours`;
        body = `${visit.speakerName} le ${new Date(visit.date).toLocaleDateString('fr-FR')}\n${visit.congregation}`;
      }

      // ID unique pour la notification
      const notificationId = parseInt(`${visit.id.replace(/\D/g, '').substring(0, 8)}${daysBefore}`, 10);

      const scheduleOptions: ScheduleOptions = {
        notifications: [
          {
            id: notificationId,
            title: title,
            body: body,
            schedule: {
              at: notificationDate
            },
            sound: 'default',
            channelId: 'visits',
            extra: {
              visitId: visit.id,
              daysBefore: daysBefore
            },
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#e64c19'
          }
        ]
      };

      await LocalNotifications.schedule(scheduleOptions);
      console.log(`✅ Notification programmée pour ${notificationDate.toLocaleString()} (ID: ${notificationId})`);
    } catch (error) {
      console.error('❌ Erreur programmation notification:', error);
    }
  }

  // Programmer des notifications pour toutes les visites à venir
  async scheduleAllUpcomingVisits(visits: Visit[]): Promise<void> {
    const hasPermission = await this.isPermissionGranted();
    
    if (!hasPermission) {
      console.log('⚠️ Notifications non autorisées - pas de programmation');
      return;
    }

    // Annuler toutes les notifications existantes d'abord
    await this.cancelAllNotifications();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureVisits = visits.filter(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= today && visit.status !== 'Cancelled';
    });

    console.log(`📅 Programmation de notifications pour ${futureVisits.length} visites futures`);

    for (const visit of futureVisits) {
      // Notification 7 jours avant
      await this.scheduleVisitNotification(visit, 7);
      // Notification 2 jours avant
      await this.scheduleVisitNotification(visit, 2);
      // Notification 1 jour avant
      await this.scheduleVisitNotification(visit, 1);
      // Notification le jour même
      await this.scheduleVisitNotification(visit, 0);
    }

    console.log(`✅ Notifications programmées avec succès`);
  }

  // Annuler toutes les notifications programmées
  async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
        console.log(`🗑️ ${pending.notifications.length} notifications annulées`);
      }
    } catch (error) {
      console.error('❌ Erreur annulation notifications:', error);
    }
  }

  // Annuler les notifications pour une visite spécifique
  async cancelVisitNotifications(visitId: string): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      const visitNotifications = pending.notifications.filter(
        n => n.extra?.visitId === visitId
      );

      if (visitNotifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: visitNotifications
        });
        console.log(`🗑️ ${visitNotifications.length} notifications annulées pour la visite ${visitId}`);
      }
    } catch (error) {
      console.error('❌ Erreur annulation notifications visite:', error);
    }
  }

  // Obtenir toutes les notifications en attente
  async getPendingNotifications(): Promise<number> {
    try {
      const pending = await LocalNotifications.getPending();
      console.log(`📋 ${pending.notifications.length} notifications en attente`);
      return pending.notifications.length;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return 0;
    }
  }

  // Tester les notifications (pour développement)
  async testNotification(): Promise<void> {
    const hasPermission = await this.isPermissionGranted();
    
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Permission refusée');
      }
    }

    try {
      // Notification immédiate
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999,
            title: '🧪 Test de Notification',
            body: 'Si vous voyez ceci, les notifications fonctionnent ! ✅',
            schedule: {
              at: new Date(Date.now() + 1000) // Dans 1 seconde
            },
            sound: 'default',
            channelId: 'visits',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#e64c19'
          }
        ]
      });

      console.log('✅ Notification de test programmée');
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      throw error;
    }
  }
}

// Instance globale
export const notificationManager = new NotificationManager();

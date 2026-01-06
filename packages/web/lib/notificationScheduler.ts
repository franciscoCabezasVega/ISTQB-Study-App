/**
 * Servicio para gestionar notificaciones locales programadas
 * Maneja la programación y cancelación de notificaciones basadas en los recordatorios del usuario
 */

export interface NotificationData {
  url?: string;
  recurring?: 'daily' | 'weekly' | 'custom';
  time?: string;
  dayOfWeek?: number;
  customDays?: number[];
  [key: string]: unknown;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  timeoutId?: number;
  data?: NotificationData;
}

class NotificationSchedulerService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private readonly STORAGE_KEY = 'scheduled-notifications';

  constructor() {
    this.loadScheduledNotifications();
  }

  /**
   * Programa una notificación para un tiempo específico
   */
  scheduleNotification(
    id: string,
    title: string,
    body: string,
    scheduledTime: Date,
    data?: NotificationData
  ): boolean {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('Cannot schedule notification in the past');
      return false;
    }

    // Cancelar notificación existente con el mismo ID
    this.cancelNotification(id);

    // Programar nueva notificación
    const timeoutId = window.setTimeout(() => {
      this.showNotification(id, title, body, data);
    }, delay);

    const notification: ScheduledNotification = {
      id,
      title,
      body,
      scheduledTime,
      timeoutId,
      data,
    };

    this.scheduledNotifications.set(id, notification);
    this.saveScheduledNotifications();

    console.log(`Notification scheduled: ${title} at ${scheduledTime.toISOString()}`);
    return true;
  }

  /**
   * Programa recordatorios diarios
   */
  scheduleDailyReminder(time: string, title: string, body: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Si ya pasó la hora hoy, programar para mañana
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const id = `daily-reminder-${time}`;
    this.scheduleNotification(id, title, body, scheduledTime, { 
      recurring: 'daily', 
      time,
      isStudyReminder: true 
    });

    return id;
  }

  /**
   * Programa recordatorios semanales en días específicos
   */
  scheduleWeeklyReminder(
    daysOfWeek: number[],
    time: string,
    title: string,
    body: string
  ): string[] {
    const ids: string[] = [];
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();

    for (const dayOfWeek of daysOfWeek) {
      const scheduledTime = this.getNextDayOfWeek(dayOfWeek, hours, minutes);

      if (scheduledTime.getTime() > now.getTime()) {
        const id = `weekly-reminder-${dayOfWeek}-${time}`;
        this.scheduleNotification(id, title, body, scheduledTime, {
          recurring: 'weekly',
          dayOfWeek,
          time,
          isStudyReminder: true
        });
        ids.push(id);
      }
    }

    return ids;
  }

  /**
   * Programa recordatorios personalizados
   */
  scheduleCustomReminder(
    days: number[],
    time: string,
    title: string,
    body: string
  ): string[] {
    return this.scheduleWeeklyReminder(days, time, title, body);
  }

  /**
   * Cancela una notificación programada
   */
  cancelNotification(id: string): boolean {
    const notification = this.scheduledNotifications.get(id);
    if (!notification) {
      return false;
    }

    if (notification.timeoutId) {
      window.clearTimeout(notification.timeoutId);
    }

    this.scheduledNotifications.delete(id);
    this.saveScheduledNotifications();

    console.log(`Notification cancelled: ${id}`);
    return true;
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  cancelAllNotifications(): void {
    for (const [, notification] of this.scheduledNotifications) {
      if (notification.timeoutId) {
        window.clearTimeout(notification.timeoutId);
      }
    }

    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();

    console.log('All notifications cancelled');
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Muestra una notificación usando el Service Worker
   */
  private async showNotification(id: string, title: string, body: string, data?: NotificationData) {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: id,
          requireInteraction: false,
          data: {
            url: '/study',
            ...data,
          },
          actions: [
            {
              action: 'study',
              title: 'Estudiar ahora',
            },
            {
              action: 'close',
              title: 'Cerrar',
            },
          ],
        } as NotificationOptions);

        // Enviar email de recordatorio al backend (sin cronjob)
        this.sendEmailReminder(id, data).catch(err => 
          console.error('Error sending email reminder:', err)
        );

        // Si es recurrente, reprogramar
        const notification = this.scheduledNotifications.get(id);
        if (notification?.data?.recurring) {
          this.rescheduleRecurringNotification(notification);
        } else {
          this.scheduledNotifications.delete(id);
          this.saveScheduledNotifications();
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Envía un email de recordatorio a través del backend
   */
  private async sendEmailReminder(id: string, data?: NotificationData) {
    try {
      // Solo en el navegador (no en SSR)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      // Solo enviar email si es un recordatorio de estudio
      if (!id.includes('reminder') && !data?.isStudyReminder) {
        return;
      }

      console.log('🔍 [sendEmailReminder] Buscando token de autenticación...');

      // Obtener token de autenticación de authStore (Zustand)
      let token = '';
      
      // Intentar obtener de localStorage primero (sesiones persistentes)
      const localAuthData = localStorage.getItem('auth-storage');
      console.log('🔍 [sendEmailReminder] localStorage auth-storage:', localAuthData ? 'encontrado' : 'vacío');
      
      if (localAuthData) {
        try {
          const parsed = JSON.parse(localAuthData);
          token = parsed?.state?.accessToken || '';
          console.log('✅ [sendEmailReminder] Token desde localStorage:', token ? 'encontrado' : 'no encontrado');
        } catch (e) {
          console.error('❌ Error parsing localStorage:', e);
        }
      }
      
      // Si no hay token en localStorage, intentar sessionStorage
      if (!token) {
        const sessionAuthData = sessionStorage.getItem('auth-storage');
        console.log('🔍 [sendEmailReminder] sessionStorage auth-storage:', sessionAuthData ? 'encontrado' : 'vacío');
        
        if (sessionAuthData) {
          try {
            const parsed = JSON.parse(sessionAuthData);
            token = parsed?.state?.accessToken || '';
            console.log('✅ [sendEmailReminder] Token desde sessionStorage:', token ? 'encontrado' : 'no encontrado');
          } catch (e) {
            console.error('❌ Error parsing sessionStorage:', e);
          }
        }
      }

      if (!token) {
        console.warn('⚠️ No authentication token found, skipping email');
        return;
      }

      console.log('✅ [sendEmailReminder] Token encontrado, enviando email...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reminders/send-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationId: id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('✅ Email reminder sent successfully');
      } else {
        console.warn('⚠️ Email reminder failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error sending email reminder:', error);
    }
  }

  /**
   * Reprograma una notificación recurrente
   */
  private rescheduleRecurringNotification(notification: ScheduledNotification) {
    if (!notification.data) return;
    
    const { recurring, time, dayOfWeek } = notification.data;
    if (!time) return;

    if (recurring === 'daily') {
      const [hours, minutes] = time.split(':').map(Number);
      const nextTime = new Date();
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(hours, minutes, 0, 0);

      this.scheduleNotification(
        notification.id,
        notification.title,
        notification.body,
        nextTime,
        notification.data
      );
    } else if (recurring === 'weekly' && dayOfWeek !== undefined) {
      const [hours, minutes] = time.split(':').map(Number);
      const nextTime = this.getNextDayOfWeek(dayOfWeek, hours, minutes);

      this.scheduleNotification(
        notification.id,
        notification.title,
        notification.body,
        nextTime,
        notification.data
      );
    }
  }

  /**
   * Obtiene la próxima fecha para un día de la semana específico
   */
  private getNextDayOfWeek(targetDay: number, hours: number, minutes: number): Date {
    const now = new Date();
    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);

    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;

    if (daysToAdd < 0 || (daysToAdd === 0 && result.getTime() <= now.getTime())) {
      daysToAdd += 7;
    }

    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  /**
   * Guarda las notificaciones programadas en localStorage
   */
  private saveScheduledNotifications() {
    try {
      // Solo en el navegador (no en SSR)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const notifications = Array.from(this.scheduledNotifications.values()).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        scheduledTime: n.scheduledTime.toISOString(),
        data: n.data,
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  /**
   * Carga las notificaciones programadas desde localStorage
   */
  private loadScheduledNotifications() {
    try {
      // Solo en el navegador (no en SSR)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const notifications = JSON.parse(stored);
      const now = new Date();

      for (const notification of notifications) {
        const scheduledTime = new Date(notification.scheduledTime);

        // Solo reprogramar si no ha pasado el tiempo
        if (scheduledTime.getTime() > now.getTime()) {
          this.scheduleNotification(
            notification.id,
            notification.title,
            notification.body,
            scheduledTime,
            notification.data
          );
        }
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }
}

// Singleton instance
export const notificationScheduler = new NotificationSchedulerService();

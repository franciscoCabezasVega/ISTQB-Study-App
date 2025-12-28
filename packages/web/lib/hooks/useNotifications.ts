'use client';

import { useEffect, useState, useCallback } from 'react';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

interface NotificationPermission {
  isSupported: boolean;
  permission: NotificationPermissionState;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  scheduleNotification: (title: string, options: NotificationOptions, delay: number) => number;
  cancelScheduledNotification: (id: number) => void;
  testNotification: () => Promise<void>;
}

/**
 * Hook para gestionar notificaciones web push
 * Soporta notificaciones inmediatas, programadas y pruebas
 */
export function useNotifications(): NotificationPermission {
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window;
  });

  useEffect(() => {
    if (isSupported && 'Notification' in window) {
      setPermission(Notification.permission as NotificationPermissionState);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<void> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    // Verificar permiso actual directamente
    const currentPermission = typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'denied';

    // Si no hay permiso, intentar solicitarlo
    if (currentPermission !== 'granted') {
      console.log('Permission not granted, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      console.log('Attempting to send notification:', title);
      
      // Intentar usar Service Worker primero
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready, showing notification');
        await registration.showNotification(title, {
          badge: '/icon-192.svg',
          icon: '/icon-192.svg',
          requireInteraction: false,
          tag: 'istqb-study-notification',
          ...options,
        });
        console.log('Notification sent successfully via Service Worker');
      } else {
        // Fallback a notificación nativa si no hay service worker
        console.log('Using native Notification API');
        new Notification(title, {
          badge: '/icon-192.svg',
          icon: '/icon-192.svg',
          ...options,
        });
        console.log('Notification sent successfully via native API');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [isSupported, requestPermission]);

  /**
   * Programa una notificación para mostrar después de un delay
   * @param title Título de la notificación
   * @param options Opciones de la notificación
   * @param delay Delay en milisegundos
   * @returns ID del timeout para poder cancelarlo
   */
  const scheduleNotification = useCallback(
    (title: string, options: NotificationOptions, delay: number): number => {
      const timeoutId = window.setTimeout(() => {
        sendNotification(title, options);
      }, delay);

      return timeoutId;
    },
    [sendNotification]
  );

  /**
   * Cancela una notificación programada
   * @param id ID del timeout retornado por scheduleNotification
   */
  const cancelScheduledNotification = useCallback((id: number): void => {
    window.clearTimeout(id);
  }, []);

  /**
   * Envía una notificación de prueba (para testing interno)
   */
  const testNotification = useCallback(async (): Promise<void> => {
    await sendNotification('🎓 ISTQB Study App', {
      body: '¡Las notificaciones están funcionando correctamente!',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'test-notification',
      requireInteraction: false,
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
    cancelScheduledNotification,
    testNotification,
  };
}


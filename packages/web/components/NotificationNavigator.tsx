'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Componente que escucha mensajes del Service Worker
 * Para manejar la navegación cuando se hace clic en una notificación
 */
export function NotificationNavigator() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        const { url } = event.data;
        if (url) {
          // Navegar a la URL especificada
          router.push(url);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [router]);

  return null;
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/useTranslation';

export function ServiceWorkerRegistration() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const { t } = useTranslation();

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdateBanner(false);
    // Recargar cuando el nuevo SW tome el control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });
  }, [waitingWorker]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        // Si ya hay un SW esperando al registrar (p.ej. tras recarga), mostrar banner
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdateBanner(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay un SW nuevo instalado y listo — mostrar banner de actualización
              setWaitingWorker(newWorker);
              setShowUpdateBanner(true);
            }
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });

    // Escuchar mensajes del SW (ej. sync complete)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        const { synced, errors } = event.data;
        if (synced > 0) {
          console.log(`[SW] Synced ${synced} answers offline`);
        }
        if (errors > 0) {
          console.warn(`[SW] ${errors} answers failed to sync`);
        }
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  if (!showUpdateBanner) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-0 left-0 right-0 z-50 bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-lg"
    >
      <span className="text-sm font-medium">
        {t('pwa.updateAvailable')}
      </span>
      <div className="flex gap-2 ml-4 shrink-0">
        <button
          onClick={applyUpdate}
          className="bg-white text-indigo-600 text-sm font-semibold px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
        >
          {t('pwa.updateNow')}
        </button>
        <button
          onClick={() => setShowUpdateBanner(false)}
          className="text-white/80 hover:text-white text-sm px-2 py-1 transition-colors"
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

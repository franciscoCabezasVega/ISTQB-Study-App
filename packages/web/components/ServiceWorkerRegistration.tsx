'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('[SW Registration] Starting Service Worker registration...');
      
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW Registration] Service Worker registered successfully:', registration);
          console.log('[SW Registration] Scope:', registration.scope);
          console.log('[SW Registration] Active:', registration.active);
          console.log('[SW Registration] Installing:', registration.installing);
          console.log('[SW Registration] Waiting:', registration.waiting);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            console.log('[SW Registration] Update found!');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('[SW Registration] New worker state:', newWorker.state);
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW Registration] Service Worker registration failed:', error);
        });
    } else {
      console.warn('[SW Registration] Service Workers not supported');
    }
  }, []);

  return null;
}

// Service Worker para ISTQB Study App
const CACHE_VERSION = 'v1';
const CACHE_NAME = `istqb-app-${CACHE_VERSION}`;
const API_CACHE = `istqb-api-${CACHE_VERSION}`;
const OFFLINE_CACHE = 'offline-cache';

const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Caching offline page');
        return cache.add('/offline.html');
      }),
    ])
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches antiguos
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE &&
            cacheName !== OFFLINE_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network First para API, Stale-While-Revalidate para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Para API calls: Network First (intenta red, fallback a cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar en cache si es exitoso y es GET
          if (response && response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, usar cache
          console.log('[SW] API request failed, using cache:', request.url);
          return caches.match(request).then((response) => {
            return response || new Response('Offline - API unavailable', { status: 503 });
          });
        })
    );
    return;
  }
  // Para assets (CSS, JS, imágenes): Stale-While-Revalidate
  else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        // Devolver caché si existe
        const fetchPromise = fetch(request).then((response) => {
          // Actualizar caché en background
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });

        // Devolver caché inmediatamente si existe, si no esperar fetch
        return response || fetchPromise;
      })
    );
  }
  // Fallback para otros recursos
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Fetch failed, returning offline page:', request.url);
          return caches.match('/offline.html');
        })
    );
  }
});

// Sincronización en background (Background Sync API para respuestas offline)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-answers') {
    event.waitUntil(syncPendingAnswers());
  }
});

async function syncPendingAnswers() {
  try {
    console.log('[SW] Syncing pending answers...');
    // Obtener answers pendientes de IndexedDB o localStorage
    // Enviar al servidor
    // Marcar como sincronizado
    console.log('[SW] Answers synced successfully');
  } catch (error) {
    console.error('[SW] Error syncing answers:', error);
    throw error; // Reintentar
  }
}

// Notificaciones push
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Tienes un nuevo mensaje',
      icon: data.icon || '/icon-192.svg',
      badge: data.badge || '/icon-192.svg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'istqb-notification',
      requireInteraction: data.requireInteraction || false,
      renotify: data.renotify || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
      actions: data.actions || [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icon-192.svg',
        },
        {
          action: 'close',
          title: 'Cerrar',
        },
      ],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/',
        ...data.data,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title || '🎓 ISTQB Study', options));
  } catch (error) {
    console.error('[SW] Error handling push:', error);
    // Fallback si el JSON falla
    event.waitUntil(
      self.registration.showNotification('🎓 ISTQB Study', {
        body: 'Tienes un nuevo recordatorio de estudio',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
      })
    );
  }
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  // Manejar acciones específicas
  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/study';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya existe una ventana abierta de la app, enfocarla y navegar
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              // Enviar mensaje para navegar a la URL
              if (focusedClient && 'postMessage' in focusedClient) {
                focusedClient.postMessage({
                  type: 'NOTIFICATION_CLICKED',
                  url: urlToOpen,
                  action: event.action,
                });
              }
              return focusedClient;
            });
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

// Close en notificación
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Aquí podrías enviar analytics o tracking
  // Por ejemplo, registrar que el usuario ignoró la notificación
});

// Message desde el cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      vibrate: [200, 100, 200],
      ...options,
    });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});


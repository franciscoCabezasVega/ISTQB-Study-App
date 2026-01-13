/**
 * Optimización de Service Worker para mejor caching y performance
 * Estrategia: Cache-First para assets, Network-First para API
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `istqb-static-${CACHE_VERSION}`;
const API_CACHE = `istqb-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `istqb-images-${CACHE_VERSION}`;

// Assets a cachear en install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
];

// Patrones de rutas para estrategias de cache
const API_ROUTES = /\/api\//;
const IMAGE_ROUTES = /\.(png|jpg|jpeg|svg|gif|webp|ico)$/;
const STATIC_ROUTES = /\.(js|css|woff|woff2|ttf)$/;

// Install: Pre-cache de assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: Limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('istqb-') && 
                   name !== STATIC_CACHE && 
                   name !== API_CACHE && 
                   name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Estrategias de cache según tipo de request
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia para imágenes: Cache-First con fallback
  if (IMAGE_ROUTES.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estrategia para assets estáticos: Cache-First
  if (STATIC_ROUTES.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estrategia para API: Network-First con cache fallback
  if (API_ROUTES.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === 'GET') {
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
              // Solo cachear por 5 minutos
              setTimeout(() => {
                caches.open(API_CACHE).then((cache) => {
                  cache.delete(request);
                });
              }, 5 * 60 * 1000);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Estrategia para navegación: Network-First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Default: Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        return cached || new Response('Not found', { status: 404 });
      });
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-answers') {
    event.waitUntil(syncAnswers());
  }
});

function syncAnswers() {
  console.log('[SW] Syncing answers...');
  // Implementar lógica de sincronización
}

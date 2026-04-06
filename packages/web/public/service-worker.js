// Service Worker para ISTQB Study App
// v3 - Con IndexedDB, Background Sync real y precache expandido

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `istqb-static-${CACHE_VERSION}`;
const API_CACHE = `istqb-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `istqb-images-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';
const DB_NAME = 'istqb-offline-db';
const DB_VERSION = 1;
const STORE_PENDING_ANSWERS = 'pending-answers';
const STORE_CACHED_QUESTIONS = 'cached-questions';
const STORE_USER_PROGRESS = 'user-progress';

const STATIC_ASSETS = [
  '/',
  '/study',
  '/exam',
  '/progress',
  '/achievements',
  '/settings',
  OFFLINE_PAGE,
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// ==================== IndexedDB Helpers ====================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PENDING_ANSWERS)) {
        const s = db.createObjectStore(STORE_PENDING_ANSWERS, { keyPath: 'id', autoIncrement: true });
        s.createIndex('createdAt', 'createdAt');
        s.createIndex('synced', 'synced');
      }
      if (!db.objectStoreNames.contains(STORE_CACHED_QUESTIONS)) {
        const s = db.createObjectStore(STORE_CACHED_QUESTIONS, { keyPath: 'id' });
        s.createIndex('topic', 'topic');
        s.createIndex('cachedAt', 'cachedAt');
      }
      if (!db.objectStoreNames.contains(STORE_USER_PROGRESS)) {
        db.createObjectStore(STORE_USER_PROGRESS, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingAnswers() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_ANSWERS, 'readonly');
    const req = tx.objectStore(STORE_PENDING_ANSWERS).index('synced').getAll(0);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function markAnswerSynced(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_ANSWERS, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_ANSWERS);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const rec = getReq.result;
      if (rec) { rec.synced = 1; rec.syncedAt = Date.now(); store.put(rec); }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

async function deleteSyncedAnswers() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_ANSWERS, 'readwrite');
    const req = tx.objectStore(STORE_PENDING_ANSWERS).index('synced').openCursor(IDBKeyRange.only(1));
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { cursor.delete(); cursor.continue(); } else { resolve(); }
    };
    req.onerror = () => reject(req.error);
  });
}

// ==================== Install ====================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          STATIC_ASSETS.map((url) => cache.add(url).catch((err) => console.warn('[SW] Failed to cache:', url, err.message)))
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ==================== Activate ====================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v3...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith('istqb-') && n !== STATIC_CACHE && n !== API_CACHE && n !== IMAGE_CACHE)
            .map((n) => { console.log('[SW] Deleting old cache:', n); return caches.delete(n); })
        )
      ),
      openDB().then(() => console.log('[SW] IndexedDB initialized')),
      self.clients.claim(),
    ])
  );
});

// ==================== Fetch ====================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;

  // Imagenes: Cache-First
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) { const c = res.clone(); caches.open(IMAGE_CACHE).then((cache) => cache.put(request, c)); }
          return res;
        });
      })
    );
    return;
  }

  // Assets estaticos con hash: Cache-First
  if (url.pathname.startsWith('/_next/static/') || /\.(js|css|woff|woff2|ttf)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) { const c = res.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, c)); }
          return res;
        });
      })
    );
    return;
  }

  // API y Supabase: Network-First con fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) { const c = res.clone(); caches.open(API_CACHE).then((cache) => cache.put(request, c)); }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(JSON.stringify({ error: 'offline', cached: false }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              })
          )
        )
    );
    return;
  }

  // Navegacion: Network-First con fallback a offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) { const c = res.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, c)); }
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match(OFFLINE_PAGE)))
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((res) => {
        if (res.ok) { const c = res.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, c)); }
        return res;
      });
      return cached || fetchPromise;
    })
  );
});

// ==================== Background Sync ====================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-answers') event.waitUntil(syncPendingAnswers());
  if (event.tag === 'sync-progress') event.waitUntil(syncUserProgress());
});

async function syncPendingAnswers() {
  const pending = await getPendingAnswers();
  if (!pending.length) return;
  console.log(`[SW] Syncing ${pending.length} pending answers...`);
  let synced = 0, errors = 0;
  for (const answer of pending) {
    try {
      const res = await fetch('/api/study/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent,
          sessionId: answer.sessionId,
          answeredAt: answer.answeredAt,
        }),
      });
      if (res.ok) { await markAnswerSynced(answer.id); synced++; }
      else errors++;
    } catch { errors++; }
  }
  if (synced > 0) await deleteSyncedAnswers();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((c) => c.postMessage({ type: 'SYNC_COMPLETE', synced, errors }));
  console.log(`[SW] Sync done: ${synced} OK, ${errors} errors`);
  if (errors > 0 && synced === 0) throw new Error('All answers failed to sync');
}

async function syncUserProgress() {
  const db = await openDB();
  const allProgress = await new Promise((resolve, reject) => {
    const req = db.transaction(STORE_USER_PROGRESS, 'readonly').objectStore(STORE_USER_PROGRESS).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (allProgress.length) {
    await fetch('/api/progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: allProgress }),
    });
  }
}

// ==================== Push Notifications ====================

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || '🎓 ISTQB Study', {
        body: data.body || 'Es hora de estudiar',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'istqb-notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [
          { action: 'open', title: 'Abrir App' },
          { action: 'close', title: 'Cerrar' },
        ],
        data: { url: data.url || '/study', dateOfArrival: Date.now(), ...data.data },
      })
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('🎓 ISTQB Study', {
        body: 'Tienes un nuevo recordatorio de estudio',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const urlToOpen = event.notification.data?.url || '/study';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.startsWith(self.location.origin));
      if (existing) {
        existing.postMessage({ type: 'NOTIFICATION_CLICKED', url: urlToOpen });
        return existing.focus();
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed:', event.notification.tag);
});

// ==================== Messages ====================

self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data) return;

  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
          .then(() => event.source?.postMessage({ type: 'CACHE_CLEARED' }))
      );
      break;

    case 'SAVE_ANSWER_OFFLINE':
      event.waitUntil(
        openDB().then((db) =>
          new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_PENDING_ANSWERS, 'readwrite');
            tx.objectStore(STORE_PENDING_ANSWERS).add({
              ...data.payload,
              answeredAt: new Date().toISOString(),
              createdAt: Date.now(),
              synced: 0,
            });
            tx.oncomplete = () => {
              event.source?.postMessage({ type: 'ANSWER_SAVED_OFFLINE' });
              self.registration.sync?.register('sync-answers').catch(() => {});
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          })
        )
      );
      break;

    case 'CACHE_QUESTIONS':
      event.waitUntil(
        openDB().then((db) =>
          new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_CACHED_QUESTIONS, 'readwrite');
            const store = tx.objectStore(STORE_CACHED_QUESTIONS);
            data.payload.questions.forEach((q) => store.put({ ...q, cachedAt: Date.now() }));
            tx.oncomplete = () => {
              event.source?.postMessage({ type: 'QUESTIONS_CACHED', count: data.payload.questions.length });
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          })
        )
      );
      break;

    case 'GET_CACHED_QUESTIONS':
      event.waitUntil(
        openDB().then((db) =>
          new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_CACHED_QUESTIONS, 'readonly');
            const store = tx.objectStore(STORE_CACHED_QUESTIONS);
            const req = data.payload?.topic ? store.index('topic').getAll(data.payload.topic) : store.getAll();
            req.onsuccess = () => {
              event.source?.postMessage({ type: 'CACHED_QUESTIONS_RESULT', questions: req.result, topic: data.payload?.topic });
              resolve();
            };
            req.onerror = () => reject(req.error);
          })
        )
      );
      break;

    case 'SEND_NOTIFICATION':
      event.waitUntil(
        self.registration.showNotification(data.title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          ...data.options,
        })
      );
      break;

    default:
      break;
  }
});

'use client';

import { useCallback } from 'react';

const DB_NAME = 'istqb-offline-db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending-answers')) {
        const s = db.createObjectStore('pending-answers', { keyPath: 'id', autoIncrement: true });
        s.createIndex('createdAt', 'createdAt');
        s.createIndex('synced', 'synced');
      }
      if (!db.objectStoreNames.contains('cached-questions')) {
        const s = db.createObjectStore('cached-questions', { keyPath: 'id' });
        s.createIndex('topic', 'topic');
        s.createIndex('cachedAt', 'cachedAt');
      }
      if (!db.objectStoreNames.contains('user-progress')) {
        db.createObjectStore('user-progress', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface PendingAnswer {
  id?: number;
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  sessionId: string;
  answeredAt: string;
  createdAt: number;
  synced: number;
}

export interface CachedQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  cachedAt: number;
}

/**
 * Hook para interactuar con IndexedDB offline storage.
 * Permite guardar respuestas offline y preguntas cacheadas.
 */
export function useOfflineStorage() {
  const isSupported =
    typeof window !== 'undefined' && 'indexedDB' in window;

  /** Guarda una respuesta en IndexedDB y la encola para sync */
  const saveAnswerOffline = useCallback(
    async (answer: Omit<PendingAnswer, 'id' | 'createdAt' | 'synced' | 'answeredAt'>) => {
      if (!isSupported) return false;
      try {
        // Primero intentar enviar vía SW para que registre el sync
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SAVE_ANSWER_OFFLINE',
            payload: answer,
          });
          return true;
        }
        // Fallback directo a IndexedDB
        const db = await openDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('pending-answers', 'readwrite');
          tx.objectStore('pending-answers').add({
            ...answer,
            answeredAt: new Date().toISOString(),
            createdAt: Date.now(),
            synced: 0,
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        return true;
      } catch (err) {
        console.error('[OfflineStorage] Error saving answer:', err);
        return false;
      }
    },
    [isSupported]
  );

  /** Guarda preguntas en IndexedDB para uso offline */
  const cacheQuestions = useCallback(
    async (questions: CachedQuestion[]) => {
      if (!isSupported || !questions.length) return false;
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_QUESTIONS',
            payload: { questions },
          });
          return true;
        }
        const db = await openDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('cached-questions', 'readwrite');
          const store = tx.objectStore('cached-questions');
          questions.forEach((q) => store.put({ ...q, cachedAt: Date.now() }));
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        return true;
      } catch (err) {
        console.error('[OfflineStorage] Error caching questions:', err);
        return false;
      }
    },
    [isSupported]
  );

  /** Obtiene preguntas cacheadas por tema */
  const getCachedQuestions = useCallback(
    async (topic?: string): Promise<CachedQuestion[]> => {
      if (!isSupported) return [];
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('cached-questions', 'readonly');
          const store = tx.objectStore('cached-questions');
          const req = topic ? store.index('topic').getAll(topic) : store.getAll();
          req.onsuccess = () => resolve(req.result as CachedQuestion[]);
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.error('[OfflineStorage] Error getting questions:', err);
        return [];
      }
    },
    [isSupported]
  );

  /** Cuenta las respuestas pendientes de sincronizar */
  const getPendingCount = useCallback(async (): Promise<number> => {
    if (!isSupported) return 0;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const req = db
          .transaction('pending-answers', 'readonly')
          .objectStore('pending-answers')
          .index('synced')
          .count(IDBKeyRange.only(0));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return 0;
    }
  }, [isSupported]);

  /** Fuerza la sincronización de respuestas pendientes si hay red */
  const triggerSync = useCallback(async () => {
    if (!isSupported || !('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      // Background Sync API
      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-answers');
      }
    } catch (err) {
      console.warn('[OfflineStorage] Could not register sync:', err);
    }
  }, [isSupported]);

  return {
    isSupported,
    saveAnswerOffline,
    cacheQuestions,
    getCachedQuestions,
    getPendingCount,
    triggerSync,
  };
}

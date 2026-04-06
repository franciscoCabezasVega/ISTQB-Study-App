/**
 * Hook optimizado para llamadas a la API con caché y deduplicación
 * Mejora el performance reduciendo requests redundantes
 */

import { useEffect, useState, useRef, useCallback } from 'react';

// Caché simple en memoria para requests con límite de entradas (FIFO)
const MAX_CACHE_SIZE = 100;
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function setCacheEntry(key: string, value: { data: any; timestamp: number }) {
  // Evicción simple: si supera el límite, eliminar la entrada más antigua
  if (requestCache.size >= MAX_CACHE_SIZE && !requestCache.has(key)) {
    const oldestKey = requestCache.keys().next().value;
    if (oldestKey) requestCache.delete(oldestKey);
  }
  requestCache.set(key, value);
}

// Deduplicación de requests en vuelo
const pendingRequests = new Map<string, Promise<any>>();

export function useOptimizedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    enabled?: boolean;
    cacheTime?: number;
    refetchOnMount?: boolean;
  }
) {
  const {
    enabled = true,
    cacheTime = CACHE_TTL,
    refetchOnMount = false,
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Verificar caché
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      return;
    }

    // Deduplicar requests en vuelo
    if (pendingRequests.has(key)) {
      try {
        const result = await pendingRequests.get(key);
        if (mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err as Error);
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const requestPromise = fetcher();
    pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      
      if (mountedRef.current) {
        setData(result);
        // Actualizar caché
        setCacheEntry(key, {
          data: result,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      pendingRequests.delete(key);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [key, fetcher, enabled, cacheTime]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (refetchOnMount || !requestCache.has(key)) {
      fetchData();
    } else {
      const cached = requestCache.get(key);
      if (cached) {
        setData(cached.data);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, key, refetchOnMount]);

  const refetch = useCallback(() => {
    requestCache.delete(key);
    return fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    requestCache.delete(key);
  }, [key]);

  return {
    data,
    error,
    isLoading,
    refetch,
    invalidate,
  };
}

// Función para limpiar el caché
export function clearCache() {
  requestCache.clear();
  pendingRequests.clear();
}

// Función para invalidar una clave específica
export function invalidateCache(key: string) {
  requestCache.delete(key);
}

// Hook para batch de múltiples requests
export function useBatchFetch<T>(
  requests: Array<{ key: string; fetcher: () => Promise<T> }>,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<(Error | null)[]>([]);

  useEffect(() => {
    if (!enabled || requests.length === 0) return;

    let mounted = true;
    setIsLoading(true);

    const fetchAll = async () => {
      const results = await Promise.allSettled(
        requests.map((req) => {
          const cached = requestCache.get(req.key);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return Promise.resolve(cached.data);
          }
          return req.fetcher().then((result) => {
            setCacheEntry(req.key, {
              data: result,
              timestamp: Date.now(),
            });
            return result;
          });
        })
      );

      if (mounted) {
        const successData: T[] = [];
        const errorList: (Error | null)[] = [];

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successData.push(result.value);
            errorList.push(null);
          } else {
            successData.push(null as any);
            errorList.push(result.reason);
          }
        });

        setData(successData);
        setErrors(errorList);
        setIsLoading(false);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, [enabled, requests]);

  return { data, errors, isLoading };
}

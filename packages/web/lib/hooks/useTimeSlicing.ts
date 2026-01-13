/**
 * Hook para time slicing de operaciones pesadas
 * Divide operaciones costosas en chunks para reducir TBT
 */

import { useState, useEffect, useCallback } from 'react';

interface TimeSlicingOptions {
  chunkSize?: number;
  delay?: number;
}

export function useTimeSlicing<T>(
  items: T[],
  options: TimeSlicingOptions = {}
) {
  const { chunkSize = 10, delay = 0 } = options;
  const [processedItems, setProcessedItems] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setProcessedItems([]);
      setProgress(0);
      return;
    }

    setIsProcessing(true);
    let cancelled = false;
    let currentIndex = 0;

    const processChunk = () => {
      if (cancelled) return;

      const chunk = items.slice(currentIndex, currentIndex + chunkSize);
      
      setProcessedItems((prev) => [...prev, ...chunk]);
      currentIndex += chunkSize;
      setProgress(Math.min((currentIndex / items.length) * 100, 100));

      if (currentIndex < items.length) {
        // Usar requestIdleCallback si está disponible, sino setTimeout
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => processChunk(), { timeout: 100 });
        } else {
          setTimeout(processChunk, delay);
        }
      } else {
        setIsProcessing(false);
      }
    };

    // Iniciar procesamiento
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => processChunk(), { timeout: 100 });
    } else {
      setTimeout(processChunk, delay);
    }

    return () => {
      cancelled = true;
      setProcessedItems([]);
      setProgress(0);
    };
  }, [items, chunkSize, delay]);

  return { processedItems, isProcessing, progress };
}

// Hook para diferir la carga de componentes pesados
export function useDeferredLoading(delay: number = 100) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Diferir hasta que el navegador esté idle
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => {
        setShouldLoad(true);
      }, { timeout: delay });

      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return shouldLoad;
}

// Hook para cargar módulos bajo demanda con prioridad baja
export function useLazyModule<T>(
  loader: () => Promise<T>,
  options: { defer?: boolean; timeout?: number } = {}
) {
  const { defer = true, timeout = 200 } = options;
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (module || loading) return;

    setLoading(true);
    setError(null);

    try {
      const loaded = await loader();
      setModule(loaded);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader, module, loading]);

  useEffect(() => {
    if (!defer) {
      load();
      return;
    }

    // Diferir carga hasta idle time
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => {
        load();
      }, { timeout });

      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => {
        load();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [defer, timeout, load]);

  return { module, loading, error, reload: load };
}

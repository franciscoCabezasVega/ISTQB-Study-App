/**
 * Wrapper para lazy loading de stores de Zustand
 * Reduce el bundle inicial diferiendo la carga de stores no críticos
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cache para stores ya cargados
const storeCache = new Map<string, any>();

/**
 * Carga un store de forma lazy
 * @param storeLoader - Función que retorna la promesa del store
 * @param storeKey - Clave única para el store
 */
export async function loadStore<T>(
  storeLoader: () => Promise<{ default: any }>,
  storeKey: string
): Promise<T> {
  if (storeCache.has(storeKey)) {
    return storeCache.get(storeKey);
  }

  const module = await storeLoader();
  const store = module.default;
  storeCache.set(storeKey, store);
  
  return store;
}

/**
 * Hook para cargar stores de forma diferida
 */
export function useLazyStore<T>(
  storeLoader: () => Promise<{ default: any }>,
  storeKey: string,
  defaultValue: T
): T {
  const [store, setStore] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    let mounted = true;

    // Diferir carga hasta idle time
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(async () => {
        const loadedStore = await loadStore<T>(storeLoader, storeKey);
        if (mounted) {
          setStore(loadedStore);
        }
      }, { timeout: 200 });

      return () => {
        mounted = false;
        cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(async () => {
        const loadedStore = await loadStore<T>(storeLoader, storeKey);
        if (mounted) {
          setStore(loadedStore);
        }
      }, 200);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [storeLoader, storeKey]);

  return store;
}

// Re-exportar React para el hook
import React from 'react';

/**
 * Preload de stores críticos
 * Llamar en el layout principal para precargar stores importantes
 */
export function preloadCriticalStores() {
  // Precargar authStore que es crítico
  if (typeof window !== 'undefined') {
    requestIdleCallback(() => {
      import('@/lib/store/authStore');
    }, { timeout: 100 });
  }
}

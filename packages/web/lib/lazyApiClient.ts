/**
 * Wrapper de API client con lazy loading
 * Reduce el bundle inicial cargando el cliente bajo demanda
 */

let apiClientInstance: any = null;

/**
 * Obtiene el API client de forma lazy
 * Solo se carga cuando se necesita por primera vez
 */
export async function getApiClient() {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  // Cargar el módulo de forma dinámica
  const { apiClient } = await import('@/lib/api');
  apiClientInstance = apiClient;
  
  return apiClientInstance;
}

/**
 * Hook para usar el API client de forma lazy
 */
export function useLazyApiClient() {
  const [client, setClient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadClient = async () => {
      const apiClient = await getApiClient();
      if (mounted) {
        setClient(apiClient);
        setLoading(false);
      }
    };

    loadClient();

    return () => {
      mounted = false;
    };
  }, []);

  return { client, loading };
}

import React from 'react';

/**
 * Preload del API client
 * Llamar en layout para precargar el cliente
 */
export function preloadApiClient() {
  if (typeof window !== 'undefined') {
    requestIdleCallback(() => {
      getApiClient();
    }, { timeout: 100 });
  }
}

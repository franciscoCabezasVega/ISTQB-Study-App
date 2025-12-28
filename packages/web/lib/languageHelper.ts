/**
 * Helper para obtener el idioma actual en el cliente
 * Usado para enviar el parámetro de idioma en las peticiones API
 */
export const getCurrentLanguage = (): 'es' | 'en' => {
  if (typeof window === 'undefined') {
    return 'es'; // default en servidor
  }

  try {
    const stored = localStorage.getItem('istqb-language');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.language || 'es';
    }
  } catch (e) {
    console.error('Error reading language from storage:', e);
  }

  return 'es'; // default fallback
};

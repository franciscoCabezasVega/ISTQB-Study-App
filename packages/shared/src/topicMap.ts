// Mapeo de topics entre español e inglés para compatibilidad con DB
export const TOPIC_MAP: Record<string, string> = {
  // Español -> Inglés (usado al consultar API)
  'Fundamentos del Testing': 'Fundamentals of Testing',
  'Testing a lo largo del SDLC': 'Testing Throughout the Software Development Lifecycle',
  'Testing Estático': 'Static Testing',
  'Análisis y Diseño de Pruebas': 'Test Analysis and Design',
  'Gestión de Actividades de Prueba': 'Managing the Test Activities',
  'Herramientas de Prueba': 'Test Tools',
  
  // Inglés -> Español (usado al mostrar en UI)
  'Fundamentals of Testing': 'Fundamentos del Testing',
  'Testing Throughout the Software Development Lifecycle': 'Testing a lo largo del SDLC',
  'Static Testing': 'Testing Estático',
  'Test Analysis and Design': 'Análisis y Diseño de Pruebas',
  'Managing the Test Activities': 'Gestión de Actividades de Prueba',
  'Test Tools': 'Herramientas de Prueba',
};

// Función para traducir topic de español a inglés (para consultas a DB)
export function translateTopicToEnglish(topicEs: string): string {
  return TOPIC_MAP[topicEs] || topicEs;
}

// Función para traducir topic de inglés a español (para mostrar en UI)
export function translateTopicToSpanish(topicEn: string): string {
  return TOPIC_MAP[topicEn] || topicEn;
}

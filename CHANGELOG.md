# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Planeado
- Mejoras en el algoritmo de repetición espaciada
- Análisis detallado de exámenes simulados
- Más tipos de preguntas interactivas

---

## [1.0.0-alpha] - 2025-12-28

### 🎉 Lanzamiento Inicial - Versión Alpha

#### ✨ Funcionalidades Principales

**Motor de Preguntas**
- Generación de preguntas basadas en el syllabus ISTQB Foundation Level
- Soporte para preguntas de opción múltiple, verdadero/falso y situacionales
- Sistema de evaluación en tiempo real con feedback detallado
- Explicaciones basadas en el syllabus ISTQB con referencias

**Gestión de Progreso**
- Seguimiento detallado del progreso del usuario por tema
- Métricas de rendimiento (porcentaje de aciertos, evolución temporal)
- Historial completo de preguntas respondidas
- Identificación de temas dominados y débiles

**Simulador de Examen ISTQB**
- Simulación real del examen: 40 preguntas en 60 minutos
- Preguntas aleatorias por tema siguiendo el estándar ISTQB
- Resultados detallados con análisis por tema
- Estimación de probabilidad de aprobar
- Estadísticas de rendimiento persistentes

**Repetición Espaciada**
- Implementación de algoritmo tipo SM-2
- Refuerzo automático de preguntas falladas
- Ajuste de frecuencia según desempeño
- Sistema de priorización inteligente

**Banco de Errores**
- Registro automático de errores
- Revisión y reintento de preguntas falladas
- Explicaciones ampliadas para cada error
- Filtrado por tema y dificultad

**Gamificación**
- Sistema de logros y badges
- Streaks de estudio diarios
- Niveles de preparación por tema
- Progreso visual con barras y porcentajes

**Sistema de Recordatorios**
- Configuración personalizada de frecuencia (diaria, semanal, días personalizados)
- Recordatorios por email
- Notificaciones web push (Web Push API)
- Gestión completa desde la UI

**PWA - Progressive Web App**
- Instalable en dispositivos móviles y desktop
- Modo offline completo
- Cache inteligente de preguntas y contenido
- Service Workers para sincronización en background
- Manifest.json optimizado

**Multi-idioma (i18n)**
- Soporte completo para Español e Inglés
- Cambio de idioma desde la UI
- Contenido adaptado por idioma (preguntas, explicaciones, UI)
- Sistema extensible para más idiomas

**Autenticación y Seguridad**
- Autenticación con Email/Password vía Supabase Auth
- Sesiones seguras con JWT
- Row Level Security (RLS) implementado
- Validación de tokens en frontend y backend

**Panel de Administración**
- Gestión de usuarios
- Estadísticas globales de uso
- Monitoreo de rendimiento
- CRUD de preguntas y contenido

#### 🏗️ Arquitectura Técnica

**Frontend**
- Next.js 16 con React 19
- TypeScript estricto
- Tailwind CSS para estilos
- Zustand para gestión de estado
- next-intl para internacionalización
- Vitest + React Testing Library para tests

**Backend**
- Node.js con Express
- TypeScript
- Supabase como BaaS (Backend as a Service)
- PostgreSQL como base de datos
- Edge Functions para lógica serverless

**Infraestructura**
- Monorepo con workspaces (npm workspaces)
- Estructura modular: packages/web, packages/api, packages/shared
- Testing automatizado (unit + integration)
- CI/CD con Render

**Base de Datos**
- PostgreSQL (Supabase)
- Migraciones versionadas
- Funciones SQL optimizadas
- Índices para rendimiento

#### 📦 Paquetes y Dependencias

**Core**
- next: ^16.1.0
- react: ^19.2.3
- @supabase/supabase-js: ^2.39.0
- zustand: ^5.0.9
- axios: ^1.6.2

**Utilidades**
- date-fns: ^4.1.0
- clsx: ^2.1.0
- uuid: ^13.0.0

**Testing**
- vitest
- @testing-library/react
- @testing-library/jest-dom

#### 🐛 Problemas Conocidos (Alpha)
- El algoritmo de repetición espaciada aún requiere ajustes finos
- Las notificaciones push requieren HTTPS (no funcionan en localhost)
- Limitaciones en el modo offline para contenido dinámico

#### 📝 Notas de la Versión Alpha
Esta es la primera versión alpha pública del proyecto. Todas las funcionalidades principales están implementadas y funcionales, pero aún estamos en fase de pruebas y ajustes. Se esperan mejoras continuas basadas en feedback de usuarios.

---

## Tipos de Cambios

- `✨ Added` para nuevas funcionalidades
- `🔧 Changed` para cambios en funcionalidades existentes
- `🗑️ Deprecated` para funcionalidades que serán removidas
- `🔥 Removed` para funcionalidades removidas
- `🐛 Fixed` para corrección de bugs
- `🔒 Security` para cambios relacionados con seguridad
- `⚡ Performance` para mejoras de rendimiento
- `📚 Documentation` para cambios en documentación

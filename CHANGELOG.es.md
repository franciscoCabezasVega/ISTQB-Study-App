# 📝 Registro de Cambios

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).


## [1.0.3](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.2...v1.0.3) (2026-01-03)

### 🐛 Corrección de Errores

* resolve all ESLint warnings across API and Web packages ([43b1ef2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/43b1ef2d1b22ec44464bb7bd2ad0f6b048d6ed05))

## [1.0.2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.1...v1.0.2) (2026-01-03)

### 🐛 Corrección de Errores

* **tests:** add TypeScript configuration for Jest tests ([b899904](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b8999049844c37c9577c7c73c39e83a510af417a))

## [1.0.1](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.0...v1.0.1) (2026-01-03)

### 🐛 Corrección de Errores

* resolve TypeScript AuthRequest interface and add missing dependency ([46286bb](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/46286bb3edf30066f442e9bfd9eb7ef91d871e8d))

## 1.0.0 (2026-01-03)

### ✨ Nuevas Características

* v1.0.1-alpha - Remove difficulty system & improve testing ([e273286](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/e273286ecdde51ec6a6c0d4d7f155a8843bc825b))

### 🐛 Corrección de Errores

* add missing conventional-changelog-conventionalcommits dependency ([0a93e46](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/0a93e46bdbc1eaf54114a5fb1b360245c01101af))
* index.ts ([57457d5](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/57457d58707ee79ee02e81d8196af855958401ff))
* prevent husky from failing in CI/CD environments ([b7b90c8](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b7b90c862539690ba450f085c1a9bf18a8eed26f))
* Service type ([b415f6b](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b415f6be199a4f1824fff4934f2b17b55da59c79))
* tsconfig.json ([230785c](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/230785cbeeaf2b8050fd39f62c821f870c931ee8))

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

## [1.0.1-alpha] - 2026-01-02

### 🔥 Removed

**Sistema de Dificultad Eliminado**
- Eliminado sistema de selección de dificultad (fácil/medio/difícil) en todo el proyecto
- Eliminadas columnas `difficulty_es` y `difficulty_en` de la tabla `questions`
- Removido parámetro de dificultad de todas las APIs y componentes
- Simplificación de la interfaz: ahora el estudio se enfoca solo en temas
- Migración aplicada: `20260102_remove_difficulty_columns.sql`

**Archivos Obsoletos**
- Eliminados 15 archivos deprecados:
  - `temp_check.txt`
  - 12 documentos obsoletos (DEPLOY_STATUS, EMAILJS_MIGRATION, etc.)
  - Scripts de setup: `setup.bat`, `setup.sh`

### ✨ Added

**Distribución Oficial ISTQB en Exámenes**
- Implementada distribución oficial de preguntas por capítulo en exámenes simulados:
  - Fundamentals of Testing: 8 preguntas
  - Testing Throughout SDLC: 6 preguntas  
  - Static Testing: 4 preguntas
  - Test Analysis and Design: 11 preguntas
  - Managing Test Activities: 9 preguntas
  - Test Tools: 2 preguntas
- Algoritmo de selección aleatoria mejorado con Fisher-Yates shuffle
- Documentación completa en `docs/EXAM_DISTRIBUTION.md`

**Protección de Sesiones de Estudio y Examen**
- Detección y prevención de refresh durante sesiones activas
- Detección de cambio de idioma durante sesiones activas
- Redirección automática al home en caso de interrupciones
- Limpieza de sessionStorage al completar o abandonar sesiones

**Tests Automatizados**
- ✅ 68 tests de API implementados (+55 nuevos tests)
- ✅ 49 tests de Web funcionando
- **Cobertura aumentada a 30.83%** (antes: 11.88%)
- Nuevos test suites:
  - AuthService: 15 tests (signup, signin, getCurrentUser, updateUser)
  - AnswerService: 14 tests (estadísticas y success rate)
  - SpacedRepetitionService: 12 tests (algoritmo SM-2)
  - QuestionService: 11 tests (obtención y aleatorización)
  - UserService: 8 tests (gestión de perfiles)
  - ExamService: 8 tests (simulación de exámenes)

**CI/CD con GitHub Actions**
- Workflow completo de tests y linting
- Ejecución automática en PRs y commits a `main`/`develop`
- Type-checking para API y Web
- Coverage reporting con Codecov
- Archivo: `.github/workflows/ci-cd.yml`

### 🔧 Changed

**Mejoras en QuestionCard**
- Soporte para renderizado HTML en descripciones de preguntas
- Detección automática de contenido HTML vs texto plano
- Mejor manejo de saltos de línea con `whitespace-pre-line`
- Eliminado header de dificultad

**API Simplificada**
- `createExamSession()` ya no requiere parámetro de dificultad
- `getQuestionsByTopic()` eliminó parámetro de dificultad
- Eliminadas funciones: `getQuestionCountByDifficulty()`, `getDifficultyLabel()`
- Reducción de complejidad en servicios de preguntas y exámenes

**Componentes de Autenticación**
- Agregado `suppressHydrationWarning` en signin/signup para prevenir hydration errors
- Mejoras en el manejo de inputs de password
- Validación mejorada de fortaleza de contraseña

**README Bilingüe Actualizado**
- Badges actualizados: 68 tests passing, cobertura 30.83%
- Nueva sección detallada de testing con servicios testeados
- Documentación de integración CI/CD
- Actualizaciones en español e inglés

### ⚡ Mejoras de Rendimiento

**Optimizaciones de Supabase**
- **73% de reducción** en problemas de performance (22 → 6 issues)
- 20 políticas RLS optimizadas (evitar re-evaluación por fila)
- 6 índices agregados para foreign keys
- 11 índices no usados eliminados
- 4 políticas redundantes consolidadas
- Migración aplicada: `20260102_performance_optimization.sql`
- Documentación: `docs/PERFORMANCE_OPTIMIZATION_REPORT.md`

**Mejoras en Queries**
- Políticas RLS ahora usan `(select auth.uid())` en lugar de `auth.uid()`
- Queries RLS hasta 10x más rápidas en tablas con muchas filas
- JOINs optimizados gracias a nuevos índices

### 🐛 Fixed

**Lint y Type Errors**
- Corregidos todos los errores de ESLint en API y Web
- Configuración de ESLint 8 (API) y ESLint 9 (Web)
- Fixed: `no-case-declarations` en ReminderUtils
- Fixed: imports de Vitest en tests de Web
- Fixed: exportación default en UserService

**Correcciones de UI**
- Eliminadas referencias a dificultad en toda la interfaz
- Removidos selectores de dificultad de páginas de estudio y examen
- Actualizado sistema de traducciones (i18n) para eliminar strings de dificultad
- Limpieza de tipos en `@istqb-app/shared`

**Store de Examen**
- Eliminado campo `difficulty` de `examStore.ts`
- Actualizada interfaz `ExamState`
- Simplificada función `startExam()` (un parámetro menos)

### 🔒 Security

**Recomendación Pendiente**
- ⚠️ Habilitar "Leaked Password Protection" en Supabase dashboard
  - Ruta: Authentication → Settings → Password Settings
  - Previene uso de contraseñas comprometidas conocidas

### 📚 Documentation

**Nueva Documentación**
- `EXAM_DISTRIBUTION.md`: Explicación de distribución oficial ISTQB
- `PERFORMANCE_OPTIMIZATION_REPORT.md`: Reporte detallado de optimizaciones
- README actualizado con nueva información de tests
- GETTING_STARTED actualizado (eliminadas referencias a setup scripts)

**Migraciones**
- `20260102_remove_difficulty_columns.sql`
- `20260102_performance_optimization.sql`

### 🧪 Testing

**Estadísticas de Cobertura**
- Statements: 30.83% (antes: 11.88%)
- Branches: 19.15%
- Functions: 38.09%
- Lines: 30.92%
- **Incremento de +19 puntos porcentuales**

**Servicios con Cobertura Completa**
- ✅ AuthService (15 tests)
- ✅ AnswerService (14 tests)
- ✅ SpacedRepetitionService (12 tests)
- ✅ QuestionService (11 tests)
- ✅ UserService (8 tests)
- ✅ ExamService (8 tests)

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

# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.3.0](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.2.2...v1.3.0) (2026-04-07)

### ✨ Features

* **theme:** remove 'system' option, sync theme from DB, fix tsconfig baseUrl ([cd6f3ee](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/cd6f3ee5c4409f60ea20aec30982b1c41061c6bc))
* **web/study:** add offline support with IndexedDB cache and background sync ([4a4bcb6](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/4a4bcb665e24821e0261009e841bc60d726f7021))
* **web:** add theme system, report feature, and UI improvements ([415f566](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/415f5662dc4d994c6a2475fb5e044e5f0b1fb736))

### 🐛 Bug Fixes

* address Copilot PR review comments ([6ef5534](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/6ef5534f712773f5da32a4f6f63c5a569cb5922f))
* address Copilot PR review comments (round 2) ([ef8a267](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/ef8a2671034dfb21ba1988d4406bed778c479b3e))
* address Copilot PR review comments (round 3) ([9c5a4e3](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/9c5a4e3dcd3d57b9a2a9e734313d12ca9b3b8dc6))
* address Copilot review round 4 ([4bc6a96](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/4bc6a96505e6a264bedce97d3f8f3bc8d97bd0d6))
* address Copilot review round 5 ([07b6e75](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/07b6e754f4668b71546f0e4778a68eec82a5f3ce))
* address Copilot review round 6 ([ab783b2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/ab783b22820825786f69e776e6ea240c30a3a7a7))
* **api/specs:** move jest.mocked() to beforeAll to fix ESM ReferenceError ([71a1903](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/71a1903148d411d35bdaffdc59725fdbe28775c7))
* **deploy:** add --production=false to API buildCommand in render.yaml ([1b638cd](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/1b638cd609a371ea94153b5014bdb474dff389c5))
* **test:** replace 'as any' with UserReport type cast in reportStore test ([e5a9fbc](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/e5a9fbc90eae2d58067cde4f39e9994bec3fa9af))
* **web:** add eslint-plugin-react-hooks to fix lint errors ([216bd15](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/216bd154a1a897d2449b53c4dcb0060915f406a9))

### ♻️ Refactors

* **api:** improve services, routes, config, and add reports ([e3b5ebe](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/e3b5ebe98c5b789dd0f3130b7e8c026fcda23c90))
* **shared:** update types and fix ESM imports ([be951ce](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/be951ce03452c47667c2fa693e03ab2044dff049))

### 📝 Documentation

* update README files and package-lock ([476a131](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/476a1319ee7214564f28ff35eb0cf99ce8b7414e))

## [1.2.2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.2.1...v1.2.2) (2026-02-19)

### ⚡ Performance

* **api:** optimize scheduler to reduce supabase traffic by 83% ([ea35d25](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/ea35d254eafd3e45e7df136903ede398e58b01bf))

## [1.2.1](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.2.0...v1.2.1) (2026-01-26)

### 🐛 Bug Fixes

* **web:** improve streak visual feedback when lost ([2f63c5c](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/2f63c5cde551b1b1856e22c7b38b606bd56455fe))

---

## [Unreleased]

### ⚡ Performance

**Scheduler Optimization (Supabase Traffic Reduction)**
- **api:** optimize ReminderSchedulerService with JOIN query instead of 2 separate queries ([ReminderSchedulerService.ts](packages/api/src/services/ReminderSchedulerService.ts))
- **api:** increase reminder window from 5 to 15 minutes ([ReminderUtils.ts](packages/api/src/services/ReminderUtils.ts))
- Single JOIN query fetches reminders + user data in one request (50% reduction)
- Scheduler frequency optimized to every 15 minutes (67% reduction)
- Combined: 83% reduction in Supabase requests (288 → 49 requests/day)
- Update cron-job.org configuration to every 15 minutes (see render.yaml)

**Results:**
- ✅ 50% reduction with JOIN optimization (24 → 12 requests/hour)
- ✅ 67% reduction with 15-minute interval (12 → 4 requests/hour)
- ✅ Total: 83% reduction (24 → 4 requests/hour)
- ✅ No impact on user experience (15-minute window acceptable for study reminders)

### 🔧 Changed

**StreakCounter Component**
- **web:** improved streak display with automatic expiration detection ([StreakCounter.tsx](packages/web/components/StreakCounter.tsx))
- Automatic calculation of effective streak based on `last_study_date`
- Visual feedback when streak is broken (>1 day without studying):
  - Fire emoji 🔥 displayed in grayscale with reduced opacity
  - Counter shows 0 in gray color
  - Background and border change to gray tones
- Calculation happens client-side using `useMemo` for optimal performance
- Works for both compact and full display modes

---

* **web:** implement lazy loading for Zustand stores with preloadCriticalStores ([lazyStoreLoader.ts](packages/web/lib/store/lazyStoreLoader.ts))
* **web:** implement lazy loading for API client with useLazyApiClient hook ([lazyApiClient.ts](packages/web/lib/lazyApiClient.ts))
* **web:** add deferred loading (200ms) for /progress page statistics to reduce TBT
* **web:** enable experimental.optimizeCss in Next.js config for better CSS tree shaking
* **web:** enable experimental.optimizePackageImports for axios, zustand, date-fns ([next.config.js](packages/web/next.config.js))
* **web:** optimize /study page with React.useCallback and React.useMemo for topics list
* **web:** optimize /progress page with min-h-[140px] on all stat cards (8 cards total)
* **web:** optimize ProgressBar component with min-h-[64px] and flex centering
* **web:** update StatCardSkeleton to match Card component dimensions exactly
* **web:** add contentVisibility and contain styles to StatCardSkeleton for zero CLS

**Achieved Results:**
- ✅ /auth/signin: Performance 79/100, TBT 0ms, CLS 0.019 (perfect)
- ✅ /progress: Performance 77/100, TBT 10ms, CLS 0.759 (needs further optimization)
- ✅ 100% TBT reduction on /auth/signin (560ms → 0ms)
- ✅ 98% TBT reduction on /progress (560ms → 10ms)
- ✅ Tree shaking enabled for critical dependencies
- ✅ Lazy loading for stores and API client reduces initial bundle

### ⚡ Performance Improvements - Phase 2 (TBT & CLS Optimization)

* **web:** implement time slicing hook for heavy operations (useTimeSlicing.ts)
* **web:** add deferred loading for non-critical components (useDeferredLoading)
* **web:** optimize font loading with font-display: optional
* **web:** add content-visibility and CSS containment to reduce reflow
* **web:** add min-height to Card components to prevent CLS (200px)
* **web:** wrap Header and Footer with React.memo and useCallback optimization
* **web:** implement Suspense boundaries for better code splitting
* **web:** defer home page cards rendering until idle time (50ms)
* **web:** add fixed dimensions to CardSkeleton to prevent layout shifts
* **web:** optimize CSS animations with prefers-reduced-motion

**Target Improvements:**
- TBT: 550ms → <200ms (-64%)
- CLS: 0.235 → <0.1 (-57%)
- Performance Score: 66 → 85+ (+29%)

### ⚡ Performance Improvements - Phase 1

* **web:** enable SWC minification for faster builds and smaller bundles ([next.config.js](packages/web/next.config.js))
* **web:** enable Gzip compression and font optimization ([next.config.js](packages/web/next.config.js))
* **web:** add aggressive caching headers for static assets (1 year immutable) ([next.config.js](packages/web/next.config.js))
* **web:** add security headers (XSS, clickjacking, content-type protection) ([next.config.js](packages/web/next.config.js))
* **web:** add preconnect and DNS-prefetch for Supabase API ([layout.tsx](packages/web/app/layout.tsx))
* **web:** optimize Button component with React.memo ([Button.tsx](packages/web/components/Button.tsx))
* **web:** optimize Card component with React.memo ([Card.tsx](packages/web/components/Card.tsx))

### ✨ Features

* **web:** add lazy loading wrapper for heavy components ([LazyComponents.tsx](packages/web/components/LazyComponents.tsx))
* **web:** add optimized fetch hook with caching and deduplication ([useOptimizedFetch.ts](packages/web/lib/hooks/useOptimizedFetch.ts))
* **web:** add optimized Service Worker with smart caching strategies ([sw-optimized.js](packages/web/public/sw-optimized.js))
* **web:** add offline fallback page with auto-reload ([offline.html](packages/web/public/offline.html))
* **web:** add time slicing utilities for heavy operations ([useTimeSlicing.ts](packages/web/lib/hooks/useTimeSlicing.ts))

### 📚 Documentation

* **docs:** add comprehensive performance improvements guide ([PERFORMANCE_IMPROVEMENTS_2026.md](docs/PERFORMANCE_IMPROVEMENTS_2026.md))

### 🔧 Chores

---

## [1.2.0](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.1.0...v1.2.0) (2026-01-13)

### ✨ Features

* migrate frontend to static site, fix tests, and move cron to cron-job.org ([40b926c](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/40b926cef9493d2ec857a89857941ebd953db8d0))

---

## [1.1.0](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.9...v1.1.0) (2026-01-13)

### ✨ Features

* migrate frontend to static site and fix ESLint warnings ([3d2ee78](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/3d2ee784e05d5a1eeb281be734a0b1577c7dc7f4))

---

## [1.0.9](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.8...v1.0.9) (2026-01-06)

### 🐛 Bug Fixes

* **api:** add currentTime parameter to shouldSendToday for timezone tests ([735869e](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/735869ebce5869c9499675f065fb9469d5e49fee))
* **api:** add missing Request import in middleware ([ab9912e](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/ab9912ee83c22409dff240f14550da2e00e6cf82))
* **api:** use date-fns getHours/getMinutes for timezone compatibility ([828fd4d](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/828fd4d09e90ccd219f705a37b6dbab8927599fa))
* **api:** use formatInTimeZone for reliable timezone handling in CI ([9a0fcc7](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/9a0fcc783d3065e802932026162818631d4526d7))

## [1.0.8](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.7...v1.0.8) (2026-01-03)

### ♻️ Refactors

* simplify changelog to single English version ([3403c31](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/3403c3146e71efc5dba4e9ea66561b9af26fe868))

## [1.0.7](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.6...v1.0.7) (2026-01-03)

### 🐛 Bug Fixes

* resolve all ESLint warnings and fix GitHub release asset labels ([2372e3a](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/2372e3afcdde523f589fe4cf38cd8421002a1db4))

## [1.0.6](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.5...v1.0.6) (2026-01-03)

### 🐛 Bug Fixes

* resolve all remaining ESLint warnings and add bilingual changelogs, remove emojis from GitHub release asset labels ([4336e6a](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/4336e6ab68f7d9bcb8ff977c9be2fdd403ba69a3))

## [1.0.5](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.4...v1.0.5) (2026-01-03)

### 🐛 Bug Fixes

* resolve remaining ESLint warnings and add bilingual changelogs ([fd52cde](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/fd52cdefa4e2023a7f1ec607cb94afd0e4b6b892))

## [1.0.4](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.3...v1.0.4) (2026-01-03)

### 🐛 Bug Fixes

* resolve all ESLint warnings and improve documentation ([4677161](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/46771614b7a43986014686c40ac7b3f6919ea961))

## [1.0.3](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.2...v1.0.3) (2026-01-03)

### 🐛 Bug Fixes

* resolve all ESLint warnings across API and Web packages ([43b1ef2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/43b1ef2d1b22ec44464bb7bd2ad0f6b048d6ed05))

## [1.0.2](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.1...v1.0.2) (2026-01-03)

### 🐛 Bug Fixes

* **tests:** add TypeScript configuration for Jest tests ([b899904](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b8999049844c37c9577c7c73c39e83a510af417a))

## [1.0.1](https://github.com/franciscoCabezasVega/ISTQB-Study-App/compare/v1.0.0...v1.0.1) (2026-01-03)

### 🐛 Bug Fixes

* resolve TypeScript AuthRequest interface and add missing dependency ([46286bb](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/46286bb3edf30066f442e9bfd9eb7ef91d871e8d))

## 1.0.0 (2026-01-03)

### ✨ Features

* v1.0.1-alpha - Remove difficulty system & improve testing ([e273286](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/e273286ecdde51ec6a6c0d4d7f155a8843bc825b))

### 🐛 Bug Fixes

* add missing conventional-changelog-conventionalcommits dependency ([0a93e46](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/0a93e46bdbc1eaf54114a5fb1b360245c01101af))
* index.ts ([57457d5](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/57457d58707ee79ee02e81d8196af855958401ff))
* prevent husky from failing in CI/CD environments ([b7b90c8](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b7b90c862539690ba450f085c1a9bf18a8eed26f))
* Service type ([b415f6b](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/b415f6be199a4f1824fff4934f2b17b55da59c79))
* tsconfig.json ([230785c](https://github.com/franciscoCabezasVega/ISTQB-Study-App/commit/230785cbeeaf2b8050fd39f62c821f870c931ee8))

---

## Pre-1.0.0 Releases

For detailed historical changes including alpha releases and detailed feature descriptions, see [CHANGELOG_ARCHIVE.md](docs/archive/CHANGELOG_ARCHIVE.md)

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

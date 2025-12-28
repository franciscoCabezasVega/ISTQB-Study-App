# 🏗️ Arquitectura de ISTQB Study App

## Visión general de arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Usuarios                              │
└──────────┬──────────────────────────────────────────────┬───┘
           │                                              │
      ┌────▼────────────────────────────────────────────┐│
      │                                                  ││
      │          Frontend (Next.js PWA)                 ││
      │  ┌──────────────────────────────────────────┐  ││
      │  │  Pages (auth, study, exam, progress)     │  ││
      │  │  Components (UI, Card, Button)           │  ││
      │  │  Stores (Auth, Study, UI, Exam)          │  ││
      │  │  Service Worker (offline, cache, sync)   │  ││
      │  └──────────────────────────────────────────┘  ││
      │                                                  ││
      │         HTTP/REST API (Axios Client)            ││
      │                                                  ││
      └────┬──────────────────────────────────────────┘│
           │                                            │
           │    ┌─────────────────────────────────────┐ │
           │    │                                     │ │
      ┌────▼────▼─────────────────────────────────────▼─┐
      │                                                   │
      │       Backend (Express.js API)                   │
      │  ┌────────────────────────────────────────────┐  │
      │  │  Routes (auth, questions, answers)         │  │
      │  │  Services (Auth, Question, Answer, SR)     │  │
      │  │  Middleware (auth, error handling)         │  │
      │  │  Config (database, JWT, CORS)              │  │
      │  └────────────────────────────────────────────┘  │
      │                                                   │
      │         Supabase SDK (Database Access)           │
      │                                                   │
      └────┬────────────────────────────────────────┬───┘
           │                                        │
      ┌────▼────────────────────────────────────┐  │
      │                                         │  │
      │    Supabase (PostgreSQL Database)       │  │
      │  ┌──────────────────────────────────┐  │  │
      │  │ Tables:                          │  │  │
      │  │ - users                          │  │  │
      │  │ - questions                      │  │  │
      │  │ - user_answers                   │  │  │
      │  │ - user_progress                  │  │  │
      │  │ - spaced_repetition_cards        │  │  │
      │  │ - exam_sessions                  │  │  │
      │  │ - achievements                   │  │  │
      │  │ - study_reminders                │  │  │
      │  └──────────────────────────────────┘  │  │
      │  ┌──────────────────────────────────┐  │  │
      │  │ Auth (Email/Password + OAuth)    │  │  │
      │  └──────────────────────────────────┘  │  │
      │                                         │  │
      └─────────────────────────────────────────┘  │
                                                  │
                    ┌─────────────────────────────┘
                    │
      ┌─────────────▼──────────────────┐
      │                                │
      │  Servicios Externos            │
      │  - Email (Nodemailer/SendGrid) │
      │  - Push Notifications (APNS)   │
      │  - Analytics (Optional)        │
      │                                │
      └────────────────────────────────┘
```

## 📦 Estructura de carpetas detallada

```
packages/
│
├── shared/                          # Paquete de tipos compartidos
│   ├── src/
│   │   ├── types.ts                 # Interfaces principales
│   │   └── index.ts                 # Re-exports
│   ├── package.json
│   └── tsconfig.json
│
├── api/                             # Backend (Express + Supabase)
│   ├── src/
│   │   ├── index.ts                 # Punto de entrada
│   │   │
│   │   ├── config/
│   │   │   ├── index.ts             # Configuración general
│   │   │   └── supabase.ts          # Cliente de Supabase
│   │   │
│   │   ├── middleware/
│   │   │   └── index.ts             # Auth, error handling
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts              # POST /auth/signup, /signin
│   │   │   ├── questions.ts         # GET /questions
│   │   │   └── answers.ts           # POST /answers, GET /answers
│   │   │
│   │   └── services/
│   │       ├── AuthService.ts       # Lógica de autenticación
│   │       ├── QuestionService.ts   # Gestión de preguntas
│   │       ├── AnswerService.ts     # Registro de respuestas
│   │       └── SpacedRepetitionService.ts  # Algoritmo SM-2
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── web/                             # Frontend (Next.js PWA)
    ├── app/
    │   ├── layout.tsx               # Layout principal
    │   ├── page.tsx                 # Página de inicio
    │   ├── globals.css              # Estilos globales
    │   │
    │   ├── auth/
    │   │   ├── signup/page.tsx       # Registro
    │   │   └── signin/page.tsx       # Login
    │   │
    │   ├── study/
    │   │   └── page.tsx              # Sesión de estudio
    │   │
    │   ├── exam/
    │   │   └── page.tsx              # Simulador de examen
    │   │
    │   └── progress/
    │       └── page.tsx              # Dashboard de progreso
    │
    ├── components/
    │   ├── Button.tsx                # Botón reutilizable
    │   ├── Card.tsx                  # Tarjeta reutilizable
    │   ├── Header.tsx                # Encabezado
    │   └── ServiceWorkerRegistration.tsx  # Registro de SW
    │
    ├── lib/
    │   ├── api.ts                    # Cliente HTTP
    │   ├── i18n.ts                   # Traducciones
    │   │
    │   └── store/
    │       ├── authStore.ts          # Estado de autenticación
    │       ├── studyStore.ts         # Estado de estudio
    │       ├── uiStore.ts            # Estado de UI
    │       └── examStore.ts          # Estado de examen
    │
    ├── public/
    │   ├── manifest.json             # PWA manifest
    │   ├── service-worker.js         # Service Worker
    │   └── favicon.ico               # Icono
    │
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── package.json
```

## 🔄 Flujos de datos principales

### 1. Autenticación (Login/Signup)

```
Usuario → Frontend Form → API POST /auth/signup
                          ↓
                    AuthService.signup()
                          ↓
                    Supabase Auth + DB
                          ↓
API Response → Frontend → Zustand Store → Redirect
```

### 2. Resolver pregunta

```
Usuario selecciona respuesta → Frontend componente
                               ↓
                         Valida respuesta localmente
                               ↓
                         API POST /answers
                               ↓
                         AnswerService.recordAnswer()
                               ↓
                    Supabase: INSERT user_answers
                               ↓
                    Trigger: update_user_progress()
                               ↓
                    Response con feedback → Frontend
                               ↓
                Zustand Store + Actualiza UI
```

### 3. Algoritmo de Repetición Espaciada

```
Pregunta respondida incorrectamente
                     ↓
Backend: SpacedRepetitionService.updateCard()
                     ↓
Calcula SM-2 (ease_factor, interval)
                     ↓
Supabase: UPDATE spaced_repetition_cards
                     ↓
next_review_date = ahora + interval días
                     ↓
Frontend: Obtiene next questions (SpacedRepetitionService.getDueCards)
```

### 4. Simulador de Examen

```
Usuario → Inicia examen (Frontend)
                     ↓
API GET /questions?count=40
                     ↓
QuestionService.getQuestionsForExam()
                     ↓
Supabase: SELECT 40 preguntas aleatorias
                     ↓
Frontend: Recibe preguntas + inicia timer
                     ↓
Usuario responde (60 minutos máximo)
                     ↓
Al finalizar: Valida y calcula puntuación
                     ↓
API POST /exam/submit
                     ↓
Supabase: INSERT exam_sessions
                     ↓
Response: Resultados + feedback
```

## 🔐 Seguridad por capas

### Nivel Frontend
- ✅ HTTPS en producción
- ✅ Validación de formularios
- ✅ XSS prevention (React sanitización)
- ✅ Token storage en localStorage
- ✅ CORS headers

### Nivel API
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS whitelist
- ✅ Input validation
- ✅ Error handling personalizado
- ✅ SQL injection prevention (ORM)

### Nivel Database
- ✅ Row Level Security (RLS)
- ✅ Autenticación de Supabase
- ✅ Encriptación en tránsito
- ✅ Backups automáticos
- ✅ Audit logs

## 📊 Modelos de datos principales

### User
```typescript
{
  id: string (UUID)
  email: string
  full_name: string
  language: 'es' | 'en'
  theme: 'light' | 'dark'
  created_at: Date
  updated_at: Date
}
```

### Question
```typescript
{
  id: string (UUID)
  title: string
  description: string
  type: 'multiple_choice' | 'true_false' | 'situational'
  difficulty: 'low' | 'medium' | 'high'
  topic: string
  options: QuestionOption[]
  correct_answer_ids: string[]
  explanation: string
  istqb_reference: string
  created_at: Date
  updated_at: Date
}
```

### SpacedRepetitionCard
```typescript
{
  id: string
  user_id: string
  question_id: string
  ease_factor: number (2.5 inicial)
  interval: number (días)
  repetitions: number
  next_review_date: Date
  last_reviewed: Date
}
```

## 🌐 PWA Features

### Service Worker
- ✅ Cache de assets (Cache-First)
- ✅ Network-First para API calls
- ✅ Background Sync
- ✅ Push Notifications
- ✅ Offline support

### Manifest
- ✅ Instalación en home screen
- ✅ Splash screens
- ✅ Theme colors
- ✅ Shortcuts
- ✅ App icons

## 📱 Adaptaciones responsivas

```css
/* Mobile First */
320px   - Phones
640px   - Large phones
1024px  - Tablets
1280px  - Desktops
1920px  - Large desktops
```

## 🧪 Estrategia de testing

### Unit Tests
- AuthService
- QuestionService
- SpacedRepetitionService
- AnswerService

### Integration Tests
- Flujos de autenticación
- CRUD de preguntas
- Registro de respuestas
- Cálculo de progreso

### E2E Tests
- Registro y login
- Completar una sesión de estudio
- Realizar un examen completo
- Ver progreso

## 🚀 Deployment

### Frontend
- Vercel / Netlify (recomendado)
- Environment: Node.js 18+
- Build: `npm run build`
- Start: `npm run start`

### Backend
- Heroku / Railway / Render
- Environment: Node.js 18+
- Build: `npm run build --workspace=packages/api`
- Start: `npm run start --workspace=packages/api`

### Database
- Supabase (managed PostgreSQL)
- Backups automáticos
- Replicación
- SSL/TLS

## 📊 Métricas y Monitoreo

### Frontend
- Page load time
- First Contentful Paint (FCP)
- Lighthouse score
- Error tracking (Sentry)

### Backend
- Response times
- Error rates
- Database query times
- API usage

### Database
- Query performance
- Storage usage
- Connection pool usage
- Backup status

## 🔄 CI/CD Pipeline (recomendado)

```
Git Push
    ↓
GitHub Actions
    ↓
Lint & Type Check
    ↓
Unit Tests
    ↓
Build
    ↓
Deploy to staging
    ↓
E2E Tests
    ↓
Deploy to production
```

---

**Última actualización:** 14 de diciembre de 2025

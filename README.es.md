# 📚 ISTQB Study App - Aplicación Web Progresiva

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.5-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![Tests](https://img.shields.io/badge/tests-0%20passing-success)
[![codecov](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App/branch/main/graph/badge.svg)](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App)

**Español** | **[English](README.md)**

Una Aplicación Web Progresiva (PWA) para ayudar a estudiantes a prepararse para la certificación ISTQB Foundation Level.

🚀 **[Demo en Vivo](https://istqb-frontend.onrender.com/)** 🚀

[Características](#-características) • [Stack Tecnológico](#-stack-tecnológico) • [Inicio Rápido](#-inicio-rápido) • [Documentación](#-documentación) • [Contribuir](#-contribuir)

</div>

---

## 🎯 Características

### 🧠 Sistema de Estudio Inteligente
- **Motor de Preguntas Inteligente**: Preguntas basadas en el syllabus oficial de ISTQB Foundation Level
- **Aleatorización de Preguntas**: Orden aleatorio de preguntas y opciones en cada sesión
- **Estudio por Temas**: Organizado en los 6 temas principales del syllabus
- **Repetición Espaciada**: Algoritmo SM-2 para reforzar conceptos débiles
- **Banco de Errores**: Revisa y reintenta preguntas respondidas incorrectamente

### 📝 Simulación de Examen
- **Simulador de Examen Completo**: 40 preguntas en 60 minutos
- **Distribución ISTQB Realista**: Sigue la distribución oficial de temas del examen
- **Estadísticas Detalladas**: Seguimiento de desempeño por tema y general
- **Probabilidad de Aprobar**: Estimación de probabilidad de aprobar basada en tus resultados

### 🎮 Gamificación y Progreso
- **Sistema de Logros**: Badges y logros desbloqueables
- **Rachas de Estudio**: Seguimiento diario de estudio
- **Panel de Progreso**: Métricas detalladas de desempeño
- **Dominio de Temas**: Rastrea tu fortaleza en cada área del syllabus

### 🌐 Moderna y Accesible
- **Aplicación Web Progresiva**: Instálala como app nativa en cualquier dispositivo
- **Modo Offline**: Accede a preguntas sin conexión a internet
- **Multi-idioma**: Soporte completo para español e inglés
- **Tema Oscuro/Claro**: Interfaz adaptable para estudio cómodo
- **Diseño Responsive**: Funciona perfectamente en móvil, tablet y desktop

### 🔔 Herramientas de Estudio
- **Recordatorios Inteligentes**: Notificaciones configurables por email y web
- **Horario Personalizado**: Establece frecuencia de estudio y horarios preferidos
- **Sesiones de Estudio**: Sesiones de práctica cronometradas con feedback

## 🏗️ Arquitectura

```
istqb-study-app/
├── packages/
│   ├── shared/          # Tipos y constantes compartidas
│   │   └── src/
│   │       ├── types.ts
│   │       └── topicMap.ts
│   ├── api/             # Backend (Express + Supabase)
│   │   └── src/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middleware/
│   │       └── config/
│   └── web/             # Frontend (Next.js)
│       ├── app/
│       ├── components/
│       └── lib/
├── docs/                # Documentación
├── migrations/          # Migraciones de base de datos
├── .github/
│   └── workflows/       # Pipelines CI/CD
└── package.json         # Raíz del monorepo
```

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth + JWT
- **Servicio de Email**: EmailJS
- **Lenguaje**: TypeScript
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Librería UI**: React 18
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: Zustand
- **Cliente HTTP**: Axios
- **Testing**: Vitest + React Testing Library
- **PWA**: next-pwa

### DevOps & Herramientas
- **Despliegue**: Render
- **CI/CD**: GitHub Actions
- **Linting**: ESLint 9
- **Verificación de Tipos**: TypeScript strict mode
- **Gestor de Paquetes**: npm workspaces

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js >= 20.x
- npm >= 10.x
- Cuenta de Supabase (tier gratuito disponible)

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/franciscoCabezasVega/ISTQB-Study-App.git
cd ISTQB-Study-App
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear `packages/api/.env`:
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT
JWT_SECRET=tu-secreto-jwt-seguro

# Servidor
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# EmailJS (para recordatorios)
EMAILJS_SERVICE_ID=tu-service-id
EMAILJS_TEMPLATE_ID=tu-template-id
EMAILJS_PUBLIC_KEY=tu-public-key
EMAILJS_PRIVATE_KEY=tu-private-key
```

Crear `packages/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Configurar base de datos Supabase**

Sigue las instrucciones en [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) para:
- Crear tablas
- Configurar Row Level Security (RLS)
- Crear índices
- Aplicar migraciones

5. **Iniciar servidores de desarrollo**

Terminal 1 - Backend:
```bash
npm run dev:api
```

Terminal 2 - Frontend:
```bash
npm run dev:web
```

Accede a la aplicación:
- Frontend: http://localhost:3000
- API Backend: http://localhost:3001

## 🧪 Testing

El proyecto cuenta con cobertura de tests completa en backend y frontend. Ver reportes detallados de cobertura en [Codecov](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App).

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests para paquete específico
npm test --workspace=packages/api
npm test --workspace=packages/web

# Ejecutar tests con reporte de cobertura
npm test -- --coverage

# Ejecutar suite de tests específica
npm test -- AuthService.spec.ts

# Verificación de tipos
npm run type-check

# Linting
npm run lint
```

### Integración CI/CD
Todos los tests se ejecutan automáticamente en:
- Pull requests a la rama `main`
- Commits a la rama `main`
- Validación pre-despliegue

Ver [.github/workflows/ci.yml](.github/workflows/ci.yml) para la configuración de CI/CD.

## 📦 Build de Producción

```bash
# Build de todos los paquetes
npm run build

# Build de paquete específico
npm run build --workspace=packages/api
npm run build --workspace=packages/web
```

## 📚 Documentación

- [Guía de Inicio](./docs/GETTING_STARTED.md)
- [Configuración de Supabase](./docs/SUPABASE_SETUP.md)
- [Descripción de Arquitectura](./docs/ARCHITECTURE.md)
- [Guías de Testing](./docs/TESTING_GUIDELINES.md)
- [Guía de Versionado](./docs/VERSIONING_GUIDE.md)
- [Guía de Despliegue](./docs/RENDER_DEPLOY_GUIDE.md)

## 📖 Temas ISTQB Cubiertos

La app cubre los 6 capítulos del syllabus ISTQB Foundation Level:

1. **Fundamentos del Testing** (8 preguntas en el examen)
   - Qué es testing
   - Por qué el testing es necesario
   - Principios del testing
   - Actividades y tareas de testing
   - Habilidades esenciales para testing

2. **Testing a lo Largo del Ciclo de Vida del Software** (6 preguntas)
   - Testing en el contexto del SDLC
   - Niveles y tipos de testing
   - Testing de mantenimiento

3. **Testing Estático** (4 preguntas)
   - Fundamentos de testing estático
   - Proceso de feedback y revisión
   - Revisiones

4. **Análisis y Diseño de Testing** (11 preguntas)
   - Descripción general de técnicas de testing
   - Técnicas de testing de caja negra
   - Técnicas de testing de caja blanca
   - Técnicas de testing basadas en experiencia
   - Enfoques de testing basados en colaboración

5. **Gestión de las Actividades de Testing** (9 preguntas)
   - Planificación de testing
   - Gestión de riesgos
   - Monitoreo y control de testing
   - Gestión de configuración
   - Gestión de defectos

6. **Herramientas de Testing** (2 preguntas)
   - Soporte de herramientas para testing
   - Beneficios y riesgos de la automatización de testing

## 📋 Versionado

Este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/). Ver [CHANGELOG.md](CHANGELOG.md) para el historial detallado de versiones.

### Crear un Release

```bash
# Script de release interactivo (recomendado)
npm run release

# Incrementos de versión rápidos
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

## 🔐 Seguridad

- ✅ Autenticación basada en JWT
- ✅ HTTPS en producción
- ✅ Configuración CORS
- ✅ Prevención de inyección SQL (PostgreSQL de Supabase)
- ✅ Protección XSS (React)
- ✅ Row Level Security (RLS) en base de datos
- ✅ Variables de entorno para datos sensibles

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama de feature (`git checkout -b feature/caracteristica-increible`)
3. Haz commit de tus cambios (`git commit -m 'Añadir característica increíble'`)
4. Haz push a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso de desarrollo.

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👏 Agradecimientos

Este proyecto fue desarrollado con la asistencia de:

- **[GitHub Copilot](https://github.com/features/copilot)** - Programador de pares con IA que aceleró el desarrollo y mejoró la calidad del código
- **[Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)** - Integración del Protocolo de Contexto de Modelo para operaciones de base de datos sin problemas
- **[Render MCP](https://render.com/docs/mcp-server)** - Integración del Protocolo de Contexto de Modelo para gestión optimizada de despliegue e infraestructura

### Construido Con
- [Next.js](https://nextjs.org/) - Framework de React
- [Supabase](https://supabase.com/) - Backend como Servicio
- [Render](https://render.com/) - Plataforma de hosting en la nube
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [TypeScript](https://www.typescriptlang.org/) - JavaScript con tipos

## 🌟 Soporte

Si encuentras este proyecto útil, por favor considera:
- ⭐ Dar estrella al repositorio
- 🐛 Reportar bugs vía [GitHub Issues](https://github.com/franciscoCabezasVega/ISTQB-Study-App/issues)
- 💡 Sugerir nuevas características
- 📖 Contribuir a la documentación

## 📞 Contacto

Para preguntas, feedback o soporte:
- Abre un [issue](https://github.com/franciscoCabezasVega/ISTQB-Study-App/issues)
- Email: [frank_vega25@hotmail.com]

---

<div align="center">

**Hecho con ❤️ para la comunidad de QA y Testing**

[⬆ Volver arriba](#-istqb-study-app---aplicación-web-progresiva)

</div>

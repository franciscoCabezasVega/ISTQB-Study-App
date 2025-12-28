# 📚 ISTQB Study App - Progressive Web Application

Una aplicación web progresiva (PWA) para ayudar a estudiantes a prepararse para la certificación ISTQB Foundation Level.

## 🎯 Características principales

- ✅ **Motor de preguntas inteligente**: Preguntas basadas en el syllabus ISTQB Foundation Level
- � **Aleatorización de preguntas**: Orden aleatorio de preguntas y opciones en cada sesión
- �📖 **Estudio por temas**: Organizado en 6 temas principales del syllabus
- 🎯 **Simulador de examen**: Modo examen de 40 preguntas en 60 minutos
- 📊 **Seguimiento de progreso**: Estadísticas detalladas de desempeño
- 🔄 **Repetición espaciada**: Algoritmo SM-2 para reforzar conceptos débiles
- 🎮 **Gamificación**: Streaks, badges y logros
- 📱 **Instalable**: Funciona como app nativa en dispositivos
- 🔌 **Offline**: Acceso a preguntas incluso sin conexión
- 🌍 **Multi-idioma**: Soporte para español e inglés
- 🎨 **Tema oscuro/claro**: Interfaz adaptable

## 📁 Estructura del proyecto

```
Estudiar ISTQB/
├── packages/
│   ├── shared/           # Tipos y constantes compartidas
│   ├── api/              # Backend (Express + Supabase)
│   └── web/              # Frontend (Next.js)
├── package.json          # Monorepo root
└── README.md
```

## 🛠️ Tecnologías usadas

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18 + Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **i18n**: Custom i18n system

### Shared
- **TypeScript**: Type definitions
- **Constants**: Enums y configuraciones

## 🚀 Instalación

### Requisitos previos
- Node.js >= 18
- npm o yarn
- Cuenta en Supabase

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd "Estudiar ISTQB"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Backend (`.env`):
```bash
cp packages/api/.env.example packages/api/.env
```

Edita `packages/api/.env`:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-jwt-secret-key
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Configurar Supabase**

Ver `docs/SUPABASE_SETUP.md` para instrucciones detalladas sobre:
- Crear tablas
- Configurar RLS (Row Level Security)
- Crear índices

5. **Iniciar en desarrollo**

Terminal 1 - Backend:
```bash
npm run dev --workspace=packages/api
```

Terminal 2 - Frontend:
```bash
npm run dev --workspace=packages/web
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📚 Documentación

- [Setup de Supabase](./docs/SUPABASE_SETUP.md)
- [Aleatorización de Preguntas](./docs/QUESTION_RANDOMIZATION.md)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Testing Guide](./docs/TESTING.md)

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Con cobertura
npm run test -- --coverage

# Ver específicamente un workspace
npm run test --workspace=packages/api
```

## 📦 Build para producción

```bash
# Construir todos los paquetes
npm run build

# Backend
npm run build --workspace=packages/api

# Frontend
npm run build --workspace=packages/web
```

## 📖 Temas cubiertos (ISTQB Foundation Level)

1. **Fundamentos del Testing** (28 preguntas)
   - Qué es testing
   - Por qué el testing es importante
   - Principios del testing
   - Procesos de testing

2. **Testing a lo largo del SDLC** (22 preguntas)
   - Testing en diferentes modelos
   - Testing en diferentes niveles
   - Tipos de testing

3. **Testing Estático** (18 preguntas)
   - Revisiones
   - Análisis estático

4. **Técnicas de Testing** (35 preguntas)
   - Diseño de casos de prueba
   - Particionamiento de equivalencia
   - Análisis de valores frontera
   - Y más...

5. **Gestión del Testing** (24 preguntas)
   - Planificación
   - Monitoreo y control
   - Defectos
   - Cierre

6. **Soporte de herramientas** (15 preguntas)
   - Características de herramientas
   - Selección e implementación

## 🔐 Seguridad

- ✅ Autenticación con JWT
- ✅ HTTPS en producción
- ✅ CORS configurado
- ✅ SQL Injection prevention (Supabase ORM)
- ✅ XSS protection (React)
- ✅ Rate limiting (recomendado en producción)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT

## 📞 Soporte

Para reportar bugs o sugerir mejoras, abre un issue en GitHub.

---

Hecho con ❤️ para la comunidad de QA y testing

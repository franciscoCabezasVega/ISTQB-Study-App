# Guía de Deploy en Render - ISTQB Study App

## 📋 Información del Proyecto

- **Repositorio**: https://github.com/franciscoCabezasVega/ISTQB-Study-App
- **Monorepo**: Workspaces de npm (packages/web, packages/api, packages/shared)
- **Base de Datos**: Supabase (pygermjcpomedeyujiut)

## 🎯 Servicios a Deployar

### 1. Frontend (Next.js PWA)
- **Tipo**: Web Service
- **Ruta**: `packages/web`
- **Runtime**: Node.js
- **Build Command**: `npm run build --workspace=packages/web`
- **Start Command**: `npm start --workspace=packages/web`
- **Variables de Entorno**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` (URL del backend)

### 2. Backend (Express API)
- **Tipo**: Web Service
- **Ruta**: `packages/api`
- **Runtime**: Node.js
- **Build Command**: `npm run build --workspace=packages/api`
- **Start Command**: `npm start --workspace=packages/api`
- **Puerto**: 3001 (o el configurado)
- **Variables de Entorno**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `EMAILJS_SERVICE_ID`
  - `EMAILJS_TEMPLATE_ID`
  - `EMAILJS_PUBLIC_KEY`
  - `NODE_ENV=production`

## 🚀 Instrucciones de Deploy

### Opción A: Usar MCP de Render (Recomendado)

Ya que tienes el MCP configurado, puedes usar estos prompts:

#### 1. Crear la Base de Datos Postgres (opcional, si no usas Supabase)
```
Create a new Postgres database named istqb-study-db with 10 GB storage
```

#### 2. Deployar Frontend Next.js
```
Create a new web service with the following configuration:
- Name: istqb-frontend
- Repository: https://github.com/franciscoCabezasVega/ISTQB-Study-App
- Branch: main
- Runtime: node
- Build Command: npm run build --workspace=packages/web
- Start Command: npm start --workspace=packages/web
- Auto Deploy: yes
- Region: oregon
- Plan: starter
- Environment Variables:
  - NEXT_PUBLIC_SUPABASE_URL: [tu_url_de_supabase]
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: [tu_anon_key]
  - NEXT_PUBLIC_API_URL: https://istqb-api.onrender.com
```

#### 3. Deployar Backend API
```
Create a new web service with the following configuration:
- Name: istqb-api
- Repository: https://github.com/franciscoCabezasVega/ISTQB-Study-App
- Branch: main
- Runtime: node
- Build Command: npm run build --workspace=packages/api
- Start Command: npm start --workspace=packages/api
- Auto Deploy: yes
- Region: oregon
- Plan: starter
- Environment Variables:
  - SUPABASE_URL: [tu_url_de_supabase]
  - SUPABASE_ANON_KEY: [tu_anon_key]
  - SUPABASE_SERVICE_ROLE_KEY: [tu_service_role_key]
  - EMAILJS_SERVICE_ID: [tu_emailjs_service_id]
  - EMAILJS_TEMPLATE_ID: [tu_emailjs_template_id]
  - EMAILJS_PUBLIC_KEY: [tu_emailjs_public_key]
  - NODE_ENV: production
```

### Opción B: Usar Dashboard de Render

1. Ve a https://dashboard.render.com/
2. Haz click en **New +** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Rellena la información según lo indicado arriba

## 🔑 Variables de Entorno Necesarias

Obtén estas credenciales de:

### Supabase (https://supabase.com/)
- `SUPABASE_URL`: De Configuración del Proyecto
- `SUPABASE_ANON_KEY`: De API Keys
- `SUPABASE_SERVICE_ROLE_KEY`: De API Keys (solo en backend)

### EmailJS (https://www.emailjs.com/)
- `EMAILJS_SERVICE_ID`: De tu dashboard
- `EMAILJS_TEMPLATE_ID`: De tu dashboard
- `EMAILJS_PUBLIC_KEY`: De tu dashboard

### Render (Generado automáticamente)
- `NEXT_PUBLIC_API_URL`: URL del backend cuando esté deployado (ej: https://istqb-api.onrender.com)

## ✅ Pasos para Deploy

1. **Verificar variables de entorno** en Supabase y EmailJS
2. **Deployar Backend primero** (así tienes la URL para el frontend)
3. **Copiar URL del Backend** → `https://istqb-api.onrender.com`
4. **Deployar Frontend** con `NEXT_PUBLIC_API_URL` configurada
5. **Esperar a que se construya** (típicamente 5-10 minutos por servicio)
6. **Probar** en https://istqb-frontend.onrender.com

## 📱 Testing en Dispositivos Reales

Después del deploy:

1. **Accede a tu app**: https://istqb-frontend.onrender.com
2. **Prueba instalación PWA**:
   - En navegadores Chrome/Edge: Busca el botón "Install"
   - En iOS: Usa "Add to Home Screen" desde el menú de compartir
3. **Prueba funcionalidades**:
   - Login/Signup
   - Preguntas y respuestas
   - Examen simulado
   - Notificaciones
   - Modo offline
4. **Revisa logs** en Render si hay errores

## 🔗 URLs de Referencia

- **Dashboard Render**: https://dashboard.render.com/
- **Repositorio GitHub**: https://github.com/franciscoCabezasVega/ISTQB-Study-App
- **Supabase Dashboard**: https://app.supabase.com/
- **EmailJS Dashboard**: https://dashboard.emailjs.com/

## 🐛 Troubleshooting

### "Build failed"
- Verifica que los comandos de build sean correctos
- Revisa los logs en Render Dashboard
- Asegúrate de que `npm install` instale los workspaces correctamente

### "Environment variable not found"
- Verifica que hayas agregado todas las variables en Render
- Las que empiezan con `NEXT_PUBLIC_` deben estar en el frontend
- Las demás van en el backend

### "Cannot connect to API"
- Verifica que `NEXT_PUBLIC_API_URL` tenga la URL correcta del backend
- Asegúrate de que el backend esté deployado primero
- Revisa CORS en `packages/api/src/index.ts`

## 📊 Monitoreo Post-Deploy

Una vez deployado, puedes monitorear:

```
Check the CPU and memory usage for my ISTQB services
```

```
Show me recent error logs for my ISTQB frontend and backend services
```

```
List the last 5 deploys for my ISTQB services
```

---

**Siguiente paso**: Usa el MCP de Render con los prompts anteriores para hacer el deploy, o ve al Dashboard de Render manualmente.

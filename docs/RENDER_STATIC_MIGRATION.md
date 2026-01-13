# Migración a Static Site en Render

## Objetivo
Reducir costos de $14/mes a $7/mes convirtiendo el frontend de Web Service ($7/mes) a Static Site (gratis).

## Cambios Realizados

### 1. Configuración de Next.js (`packages/web/next.config.js`)
- ✅ Agregado `output: 'export'` para habilitar exportación estática
- ✅ Agregado `images: { unoptimized: true }` (requerido para static export)

### 2. Configuración de Render (`render.yaml`)
- ✅ Cambiado `type: web` a `type: static` para el frontend
- ✅ Cambiado `runtime: node` a `runtime: static`
- ✅ Eliminado `startCommand` (no necesario para static sites)
- ✅ Agregado `staticPublishPath: ./packages/web/out` (carpeta de salida de Next.js)
- ✅ Agregado rewrites para manejar rutas SPA
- ✅ Agregado headers de caché optimizados

## Pasos para Aplicar en Render Dashboard

### Opción A: Crear nuevo Static Site (Recomendado)

1. **En Render Dashboard:**
   - Ve a "Static Sites" → "New Static Site"
   - Conecta tu repositorio
   - Nombre: `istqb-frontend` (o el que prefieras)

2. **Configuración Build:**
   ```
   Build Command: npm install && npm run build --workspace=packages/web
   Publish Directory: packages/web/out
   ```

3. **Variables de Entorno:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://istqb-api.onrender.com
   ```

4. **Rewrites y Redirects:**
   ```
   /* → /index.html (SPA routing)
   ```

5. **Deploy** y espera que termine

6. **Eliminar el antiguo Web Service:**
   - Ve al antiguo `istqb-frontend` Web Service
   - Settings → "Delete Web Service"
   - **Ahorro: $7/mes**

### Opción B: Usar render.yaml (Más Automatizado)

1. **Commit y push de los cambios:**
   ```bash
   git add .
   git commit -m "feat: migrate frontend to static site for cost optimization"
   git push
   ```

2. **En Render Dashboard:**
   - Ve al servicio `istqb-frontend` actual
   - Settings → "Delete Web Service" (eliminar el viejo)

3. **Crear desde render.yaml:**
   - En el Dashboard, ve a "Blueprint" o conecta el repo nuevamente
   - Render detectará el `render.yaml` actualizado
   - Creará automáticamente el Static Site

4. **Verificar deployment:**
   - Revisa que el build termine exitosamente
   - Prueba la URL del nuevo static site

## Verificación Post-Migración

1. **Funcionamiento del frontend:**
   - ✅ Todas las rutas funcionan (auth, exam, study, settings, etc.)
   - ✅ Las llamadas API van a `istqb-api.onrender.com`
   - ✅ PWA funciona correctamente
   - ✅ Assets se sirven con caché correcto

2. **Costos:**
   - Backend (istqb-api): $7/mes
   - Frontend (static site): **$0/mes**
   - Cron job: **$0/mes** (free tier)
   - **Total: $7/mes** (antes $14/mes)

## Consideraciones Importantes

### Ventajas
- ✅ **Ahorro de $7/mes** ($84/año)
- ✅ CDN global de Render (mejor rendimiento)
- ✅ Deploy más rápido (solo archivos estáticos)
- ✅ No requiere servidor Node.js para frontend

### Limitaciones
- ❌ No puedes usar API Routes de Next.js (pero no las usas actualmente)
- ❌ No puedes usar ISR o Server-Side Rendering (pero usas client-side)
- ❌ Las imágenes no se optimizan con Next.js Image Optimization (usas `unoptimized: true`)

### ¿Afecta Funcionalidad?
**NO.** Tu aplicación usa:
- ✓ Client-side rendering (CSR) → Compatible
- ✓ Llamadas API a backend separado → Compatible
- ✓ Rutas dinámicas con Next.js router → Compatible
- ✓ PWA con service worker → Compatible
- ✓ Autenticación con Supabase → Compatible

## Rollback (Si algo sale mal)

Si necesitas volver atrás:

1. **Revertir cambios en código:**
   ```bash
   git revert HEAD
   git push
   ```

2. **En Render Dashboard:**
   - Eliminar el Static Site
   - Crear nuevo Web Service con la configuración anterior:
     ```
     Build: npm install && npm run build --workspace=packages/web
     Start: npm start --workspace=packages/web
     Plan: Starter ($7/mes)
     ```

## Próximos Pasos Opcionales

Si quieres ahorrar más:

### 1. Migrar Cron Job a cron-job.org (gratis)
- Eliminar el cron service de Render
- Crear tarea en https://cron-job.org
- Configurar petición POST a tu API cada 5 minutos
- **Ahorro adicional**: Si pagas por el cron

### 2. Migrar a Vercel (gratis completo)
- Frontend: Gratis con CDN global
- Backend: Serverless Functions (gratis en Hobby)
- Cron: Vercel Cron (gratis)
- **Ahorro: $7/mes adicionales**

---

**Fecha de migración**: 13 de enero de 2026
**Ahorro estimado**: $7/mes → $84/año

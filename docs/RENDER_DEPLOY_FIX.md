# Solución de Errores de Deploy en Render

## 📋 Problemas Identificados

### Frontend (istqb-frontend) - Status 127
**Error**: `next: not found`
**Causa**: Las dependencias no se instalan. El comando de build no incluye `npm install` primero.

### Backend (istqb-api) - Status 2  
**Errores TypeScript**:
1. `Cannot find name 'console'` - falta `DOM` en lib en tsconfig
2. Property errors en tipos - problema de compilación

## ✅ Solución Inmediata

### Paso 1: Actualizar comandos en Render Dashboard

Ve a https://dashboard.render.com/ y edita cada servicio:

#### istqb-frontend
- **Build Command**: `npm install && npm run build --workspace=packages/web`
- **Start Command**: `npm start --workspace=packages/web`

#### istqb-api
- **Build Command**: `npm install && npm run build --workspace=packages/api`
- **Start Command**: `npm start --workspace=packages/api`

### Paso 2: Triggear un nuevo deploy

En cada servicio, haz click en **Redeploy** o haz un commit nuevo a GitHub.

### Paso 3: Monitorear el build

- Ve a la pestaña **Events** de cada servicio
- Verifica los logs en tiempo real

## 📝 Cambios Realizados en el Código

### 1. `packages/api/tsconfig.json`
```json
"lib": ["ES2020", "DOM"],  // Agregado "DOM"
```

### 2. `render.yaml` (Creado)
Archivo de configuración de Render para deploys futuros (opcional, pero recomendado).

## 🚀 Si sigue fallando...

1. **Revisa los logs completos** en Render Dashboard → Events → Full logs
2. **Verifica las env vars** están configuradas correctamente:
   - Frontend necesita: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
   - Backend necesita: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, etc.

3. **Si hay errores de tipos**, podría ser necesario:
   - Verificar que el monorepo se instala correctamente
   - Revisar que las referencias entre packages sean correctas
   
4. **Para forzar rebuild limpio**:
   - En Render, ve a Settings → Clear Build Cache
   - Luego triggea un redeploy

## 📊 URLs Importantes

- Dashboard Render: https://dashboard.render.com/
- istqb-frontend: https://dashboard.render.com/web/srv-d58q5gemcj7s73clo200
- istqb-api: https://dashboard.render.com/web/srv-d58q5cbuibrs73at5qag

---

**Siguiente paso**: Actualiza los comandos de build en Render Dashboard y triggea un redeploy.

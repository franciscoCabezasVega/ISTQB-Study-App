# Sistema de Recordatorios con Días Personalizados

## 🎯 Resumen de Implementación

Se ha implementado un sistema completo de recordatorios que permite a los usuarios:

✅ **Seleccionar días específicos** cuando eligen frecuencia "custom"
✅ **Scheduler automático** que respeta los días seleccionados
✅ **Zona horaria del usuario** para enviar recordatorios en su hora local
✅ **Prevención de duplicados** mediante logs
✅ **Soporte multi-idioma** (ES/EN)

## 🗂️ Archivos Creados/Modificados

### Base de Datos
- ✅ `migrations/20251225_add_custom_days_to_reminders.sql` - Migración aplicada

### Backend (API)
- ✅ `packages/api/src/services/NotificationService.ts` - Envío de emails/push
- ✅ `packages/api/src/services/ReminderUtils.ts` - Lógica de filtrado por días
- ✅ `packages/api/src/services/ReminderSchedulerService.ts` - Coordinador principal
- ✅ `packages/api/src/services/ReminderService.ts` - Actualizado con custom_days
- ✅ `packages/api/src/routes/scheduler.ts` - Endpoints del scheduler
- ✅ `packages/api/src/index.ts` - Registrado ruta del scheduler

### Frontend (Web)
- ✅ `packages/web/app/settings/reminders/page.tsx` - UI con selector de días
- ✅ `packages/web/lib/api.ts` - Cliente API actualizado
- ✅ `packages/web/lib/i18n.ts` - Traducciones de días

### Shared
- ✅ `packages/shared/src/types.ts` - Tipo StudyReminder actualizado

### Documentación
- ✅ `docs/CUSTOM_DAYS_REMINDERS.md` - Detalles de la feature de días personalizados
- ✅ `docs/REMINDER_SCHEDULER.md` - Documentación completa del scheduler
- ✅ `packages/api/scripts/test-scheduler.ts` - Script de prueba

## 🚀 Uso Rápido

### 1. Configurar Variables de Entorno

```bash
cd packages/api
cp .env.example .env
```

Editar `.env` y agregar:
```env
SCHEDULER_API_KEY=tu-clave-secreta-aqui
```

### 2. Probar el Scheduler Localmente

```bash
cd packages/api
npm run test:scheduler
```

Este comando ejecutará el scheduler y mostrará:
- Estadísticas de recordatorios activos
- Cuáles se enviarían en este momento
- Ejemplos de validación

### 3. Ejecutar el Scheduler Manualmente

Con el servidor corriendo (`npm run dev`):

```bash
curl -X POST http://localhost:3001/api/scheduler/reminders/process \
  -H "x-scheduler-key: tu-clave-secreta-aqui"
```

### 4. Ver Estadísticas

```bash
curl http://localhost:3001/api/scheduler/reminders/stats \
  -H "x-scheduler-key: tu-clave-secreta-aqui"
```

## 📅 Cómo Funciona

### Lógica de Días Personalizados

Cuando un usuario configura recordatorios con frecuencia "custom":

1. **Usuario selecciona días** en la UI (ej: Lunes, Miércoles, Viernes)
2. Se guarda como array: `custom_days: [1, 3, 5]`
3. El scheduler verifica: `¿Hoy es lunes (1), miércoles (3) o viernes (5)?`
4. Solo envía si hay coincidencia

### Ejemplo Real

**Configuración del Usuario**:
```json
{
  "frequency": "custom",
  "custom_days": [1, 3, 5],
  "preferred_time": "09:00",
  "enabled": true
}
```

**Días de la semana**: 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab

**Comportamiento**:
- 🟢 **Lunes 09:00**: Envía recordatorio ✅
- 🔴 **Martes 09:00**: NO envía (martes=2, no está en [1,3,5])
- 🟢 **Miércoles 09:00**: Envía recordatorio ✅
- 🔴 **Jueves 09:00**: NO envía
- 🟢 **Viernes 09:00**: Envía recordatorio ✅
- 🔴 **Sábado 09:00**: NO envía
- 🔴 **Domingo 09:00**: NO envía

## ⚙️ Configurar Cron Job Automático

### Opción 1: Cron-Job.org (Recomendado - Gratis)

1. Ir a [cron-job.org](https://cron-job.org)
2. Crear cuenta
3. Nuevo cron job:
   - URL: `https://tu-api.com/api/scheduler/reminders/process`
   - Método: **POST**
   - Headers: `x-scheduler-key: tu-clave-secreta`
   - Intervalo: **Cada 5 minutos**
4. Activar

### Opción 2: GitHub Actions (Gratis)

Crear `.github/workflows/scheduler.yml`:

```yaml
name: Reminder Scheduler
on:
  schedule:
    - cron: '*/5 * * * *'  # Cada 5 minutos
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://tu-api.com/api/scheduler/reminders/process \
            -H "x-scheduler-key: ${{ secrets.SCHEDULER_API_KEY }}"
```

Agregar secreto `SCHEDULER_API_KEY` en Settings → Secrets.

## 🧪 Testing

### Test del Scheduler

```bash
cd packages/api
npm run test:scheduler
```

### Test de la UI

1. Iniciar servidor y frontend
2. Ir a `/settings/reminders`
3. Seleccionar "Personalizado"
4. Elegir días (ej: Lunes, Miércoles, Viernes)
5. Guardar
6. Verificar en la consola del servidor o ejecutar el scheduler manualmente

### Verificar en Base de Datos

```sql
-- Ver recordatorios con días personalizados
SELECT 
  u.email,
  sr.frequency,
  sr.custom_days,
  sr.preferred_time,
  sr.enabled
FROM study_reminders sr
JOIN users u ON u.id = sr.user_id
WHERE sr.frequency = 'custom';

-- Ver logs de recordatorios enviados
SELECT 
  u.email,
  rl.sent_at,
  rl.status
FROM reminder_logs rl
JOIN users u ON u.id = rl.user_id
ORDER BY rl.sent_at DESC
LIMIT 10;
```

## 📊 Endpoints del Scheduler

### `POST /api/scheduler/reminders/process`
Procesar y enviar recordatorios.

**Headers**: `x-scheduler-key: tu-clave`

**Response**:
```json
{
  "success": true,
  "data": {
    "processed": 10,
    "sent": 5,
    "skipped": 4,
    "failed": 1
  }
}
```

### `GET /api/scheduler/reminders/stats`
Estadísticas de recordatorios activos.

**Headers**: `x-scheduler-key: tu-clave`

**Response**:
```json
{
  "totalActive": 15,
  "byFrequency": {
    "daily": 5,
    "weekly": 3,
    "custom": 7
  },
  "nextBatch": 2
}
```

### `GET /api/scheduler/health`
Health check (sin autenticación).

**Response**:
```json
{
  "status": "healthy",
  "service": "reminder-scheduler",
  "timestamp": "2025-12-25T10:30:00.000Z"
}
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: El endpoint del scheduler está protegido con API key.

**Cambiar en producción**:
```env
SCHEDULER_API_KEY=una-clave-muy-segura-y-aleatoria-aqui
```

No compartir esta clave públicamente.

## 📚 Documentación Completa

- [CUSTOM_DAYS_REMINDERS.md](../docs/CUSTOM_DAYS_REMINDERS.md) - Feature de días personalizados
- [REMINDER_SCHEDULER.md](../docs/REMINDER_SCHEDULER.md) - Sistema completo de scheduler

## 🎯 Próximos Pasos

1. **✅ Integrado: EmailJS** para envío de emails real
2. **Implementar push notifications** con Web Push API
3. **✅ Templates HTML profesionales** implementados
4. **Dashboard de monitoreo** de recordatorios enviados

## ❓ Troubleshooting

**Los recordatorios no se envían**:
1. Verificar que `enabled = true`
2. Verificar que hay días en `custom_days` si es custom
3. Revisar timezone del usuario
4. Ejecutar `npm run test:scheduler` para debugging

**Duplicados**:
- Verificar logs en tabla `reminder_logs`
- Asegurar que el cron job no corre múltiples veces simultáneamente

**Hora incorrecta**:
- Verificar `timezone` del usuario en BD
- Por defecto usa UTC si no está configurado

## 🎉 ¡Listo!

El sistema de recordatorios con días personalizados está completamente implementado y listo para usar.

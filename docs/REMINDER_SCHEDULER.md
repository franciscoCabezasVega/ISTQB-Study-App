# Sistema de Scheduler de Recordatorios

## Descripción General

El sistema de recordatorios ahora incluye un scheduler completo que:
- ✅ Respeta los días personalizados configurados por el usuario
- ✅ Considera la zona horaria del usuario
- ✅ Envía recordatorios en la hora preferida
- ✅ Evita duplicados (verifica si ya se envió hoy)
- ✅ Registra logs de envíos
- ✅ Soporta email y push notifications

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Cron Job Externo                         │
│           (cron-job.org, Vercel Cron, etc.)                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST
                     │ x-scheduler-key: SECRET_KEY
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          API Endpoint: POST /api/scheduler/reminders/process│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              ReminderSchedulerService                       │
│  1. Obtener recordatorios activos                          │
│  2. Para cada recordatorio:                                │
│     - Verificar si debe enviarse HOY (custom_days)         │
│     - Verificar si es la hora correcta (timezone)          │
│     - Verificar si ya se envió hoy                         │
│     - Enviar notificación                                  │
│     - Registrar log                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌──────────────────┐   ┌──────────────────┐
│ NotificationService│   │ ReminderUtils    │
│ - Email          │   │ - shouldSendToday│
│ - Push           │   │ - isTimeToSend   │
│ - Logging        │   │ - Validations    │
└──────────────────┘   └──────────────────┘
```

## Componentes Creados

### 1. NotificationService
**Archivo**: `packages/api/src/services/NotificationService.ts`

Responsabilidades:
- Enviar emails de recordatorio
- Enviar push notifications
- Registrar logs de envíos
- Verificar si ya se envió hoy

Métodos principales:
```typescript
sendEmailReminder(email, userName, language)
sendPushNotification(userId, language)
logReminderSent(reminderId, userId, status, emailId, errorMessage)
wasReminderSentToday(reminderId)
```

### 2. ReminderUtils
**Archivo**: `packages/api/src/services/ReminderUtils.ts`

Responsabilidades:
- Determinar si un recordatorio debe enviarse hoy
- Verificar si es la hora correcta
- Calcular próxima fecha de envío
- Validar configuración de recordatorios
- Formatear días para mostrar

Métodos principales:
```typescript
shouldSendToday(reminder, userTimezone) // ⭐ LÓGICA DE CUSTOM_DAYS
isTimeToSend(reminder, userTimezone)
getNextSendDate(reminder, userTimezone)
validateReminderConfig(reminder)
formatCustomDays(customDays, language)
```

#### Lógica de `shouldSendToday()`

```typescript
switch (reminder.frequency) {
  case 'daily':
    return true; // Enviar todos los días
  
  case 'weekly':
    return currentDayOfWeek === 1; // Solo lunes
  
  case 'custom':
    // Verificar si el día actual está en custom_days
    return reminder.custom_days.includes(currentDayOfWeek);
}
```

**Ejemplo**:
- Usuario selecciona: Lunes (1), Miércoles (3), Viernes (5)
- `custom_days = [1, 3, 5]`
- Si hoy es martes (2): `[1,3,5].includes(2)` → `false` → No enviar
- Si hoy es miércoles (3): `[1,3,5].includes(3)` → `true` → Enviar ✅

### 3. ReminderSchedulerService
**Archivo**: `packages/api/src/services/ReminderSchedulerService.ts`

Responsabilidades:
- Coordinar el procesamiento de recordatorios
- Prevenir ejecuciones concurrentes
- Generar estadísticas de envíos
- Manejar errores y logging

Métodos principales:
```typescript
processReminders() // Procesa y envía todos los recordatorios
getReminderStats()  // Estadísticas de recordatorios activos
```

Flujo de `processReminders()`:
1. Obtener todos los recordatorios activos
2. Obtener información de usuarios (email, timezone, language)
3. Para cada recordatorio:
   - Validar configuración
   - Verificar si debe enviarse hoy (custom_days)
   - Verificar si es la hora correcta
   - Verificar si ya se envió hoy
   - Enviar email y push
   - Registrar log
4. Retornar estadísticas

### 4. Scheduler Routes
**Archivo**: `packages/api/src/routes/scheduler.ts`

Endpoints:

#### `POST /api/scheduler/reminders/process`
Ejecuta el procesamiento de recordatorios.

**Autenticación**: Header `x-scheduler-key`

**Request**:
```bash
curl -X POST http://localhost:3001/api/scheduler/reminders/process \
  -H "x-scheduler-key: your-secret-key"
```

**Response**:
```json
{
  "success": true,
  "message": "Reminders processed successfully",
  "data": {
    "processed": 10,
    "sent": 5,
    "skipped": 4,
    "failed": 1,
    "errors": []
  }
}
```

#### `GET /api/scheduler/reminders/stats`
Obtiene estadísticas de recordatorios.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalActive": 15,
    "byFrequency": {
      "daily": 5,
      "weekly": 3,
      "custom": 7
    },
    "nextBatch": 2
  }
}
```

#### `GET /api/scheduler/health`
Health check del scheduler (sin autenticación).

## Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# Scheduler Configuration
SCHEDULER_API_KEY=your-super-secret-scheduler-key-here

# Email Service (opcional - para cuando se implemente servicio real)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@istqb-app.com
```

### Protección del Endpoint

El endpoint del scheduler está protegido con una API key en el header:

```javascript
headers: {
  'x-scheduler-key': 'your-super-secret-scheduler-key-here'
}
```

⚠️ **IMPORTANTE**: Cambiar `SCHEDULER_API_KEY` en producción por un valor secreto y seguro.

## Opciones de Cron Jobs

### Opción 1: Cron-Job.org (Recomendado - Gratis)

1. Registrarse en [cron-job.org](https://cron-job.org)
2. Crear nuevo cron job:
   - **URL**: `https://tu-dominio.com/api/scheduler/reminders/process`
   - **Método**: POST
   - **Headers**: `x-scheduler-key: your-secret-key`
   - **Schedule**: Cada 5 minutos (o según necesites)
   - **Timezone**: UTC

**Configuración recomendada**:
- Frecuencia: Cada 5 minutos
- Esto permite una ventana de 5 minutos para enviar recordatorios

### Opción 2: Vercel Cron Jobs

Crear archivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduler/reminders/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Limitaciones**: 
- Solo en plan Pro
- Requiere implementar autenticación interna

### Opción 3: GitHub Actions (Gratis)

Crear archivo `.github/workflows/scheduler.yml`:

```yaml
name: Reminder Scheduler

on:
  schedule:
    # Ejecutar cada 5 minutos
    - cron: '*/5 * * * *'
  workflow_dispatch: # Permite ejecución manual

jobs:
  process-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scheduler
        run: |
          curl -X POST https://tu-dominio.com/api/scheduler/reminders/process \
            -H "x-scheduler-key: ${{ secrets.SCHEDULER_API_KEY }}"
```

Configurar secreto `SCHEDULER_API_KEY` en GitHub repository settings.

### Opción 4: EasyCron

Similar a cron-job.org pero con más opciones.

1. Registrarse en [easycron.com](https://www.easycron.com)
2. Configurar POST request con headers personalizados

### Opción 5: Node-Cron (Auto-hospedado)

Si prefieres que el scheduler corra dentro del servidor:

```typescript
// packages/api/src/scheduler.ts
import cron from 'node-cron';
import ReminderSchedulerService from './services/ReminderSchedulerService';

// Ejecutar cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('🕐 Running scheduled reminder task...');
  await ReminderSchedulerService.processReminders();
});
```

**Instalación**:
```bash
npm install node-cron @types/node-cron --save
```

**Ventajas**: Control total, sin dependencias externas
**Desventajas**: Requiere servidor siempre corriendo

## Ventana de Tiempo

El sistema usa una ventana de 5 minutos para enviar recordatorios:

```typescript
// Ejemplo: Recordatorio configurado para las 09:00
// Se enviará si la hora actual está entre 09:00 y 09:04
isWithinWindow = currentMinute >= preferredMinute && currentMinute < preferredMinute + 5
```

**Por qué 5 minutos?**
- Si el cron job se ejecuta cada 5 minutos, garantizamos que no se pierda ningún recordatorio
- Evita envíos duplicados el mismo día

## Flujo de Ejemplo

**Configuración del Usuario**:
- Frecuencia: Custom
- Días: Lunes (1), Miércoles (3), Viernes (5)
- Hora: 09:00
- Timezone: America/Mexico_City

**Ejecución del Scheduler**:

```
🚀 Starting reminder scheduler...
📋 Found 15 active reminders

Processing reminder abc-123...
  User: juan@example.com
  Timezone: America/Mexico_City
  Today: Wednesday (3) at 09:02
  
  ✅ shouldSendToday: true (3 in [1,3,5])
  ✅ isTimeToSend: true (09:02 in window 09:00-09:04)
  ✅ Not sent today
  
📤 Sending reminder abc-123 to juan@example.com (America/Mexico_City)
📧 Email sent successfully
🔔 Push notification sent
✅ Reminder abc-123 sent successfully

📊 Scheduler Summary:
   Total processed: 15
   Successfully sent: 7
   Skipped: 7
   Failed: 1
```

## Testing

### Test Manual (Desarrollo)

```bash
# Ejecutar scheduler manualmente
curl -X POST http://localhost:3001/api/scheduler/reminders/process \
  -H "x-scheduler-key: your-secret-scheduler-key"

# Ver estadísticas
curl http://localhost:3001/api/scheduler/reminders/stats \
  -H "x-scheduler-key: your-secret-scheduler-key"

# Health check
curl http://localhost:3001/api/scheduler/health
```

### Test de Lógica de Días

```typescript
// Test en consola del navegador o Node.js
const reminder = {
  frequency: 'custom',
  custom_days: [1, 3, 5], // Lun, Mie, Vie
  enabled: true
};

const today = new Date().getDay(); // 0=Dom, 1=Lun, ...
const shouldSend = reminder.custom_days.includes(today);

console.log(`Hoy es: ${today}`);
console.log(`Días configurados: ${reminder.custom_days}`);
console.log(`¿Enviar hoy?: ${shouldSend}`);
```

## Próximos Pasos

### 1. Integrar Servicio de Email Real

Reemplazar el mock en `NotificationService.ts`:

**Opción A: Resend** (Recomendado)
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'ISTQB App <noreply@istqb-app.com>',
  to: [email],
  subject: message.subject,
  html: `<p>${message.body}</p>`,
});
```

**Opción B: SendGrid**
```bash
npm install @sendgrid/mail
```

### 2. Implementar Push Notifications

Requiere:
1. Guardar push subscriptions en BD
2. Instalar `web-push`
3. Generar VAPID keys
4. Implementar Service Worker en frontend

### 3. Mejorar Templates de Email

- Usar HTML templates profesionales
- Agregar botones de acción
- Personalizar por idioma

### 4. Dashboard de Monitoreo

- Ver logs de recordatorios enviados
- Estadísticas de apertura
- Tasa de éxito/error

## Troubleshooting

### Recordatorios no se envían

1. **Verificar que el recordatorio está activo**: `enabled = true`
2. **Verificar días configurados**: Si es `custom`, debe tener `custom_days`
3. **Verificar hora**: Debe estar en ventana de 5 minutos
4. **Verificar timezone**: Debe ser válido (IANA format)
5. **Revisar logs**: Buscar errores en consola del servidor

### Duplicados

Si se envían múltiples recordatorios el mismo día:
- Verificar que `wasReminderSentToday()` funciona correctamente
- Revisar tabla `reminder_logs`
- Asegurar que cron job no se ejecuta múltiples veces simultáneamente

### Zona horaria incorrecta

- Verificar que el usuario tiene `timezone` configurado en BD
- Por defecto usa UTC
- Actualizar timezone en configuración del usuario

## Logs de Ejemplo

```
🚀 Starting reminder scheduler...
📋 Found 25 active reminders

⏭️ Skipping reminder abc-123 - not scheduled for today
⏰ Skipping reminder def-456 - not the right time yet
✅ Reminder ghi-789 already sent today, skipping
📤 Sending reminder jkl-012 to user@example.com (America/Mexico_City)
   Subject: ⏰ ¡Es hora de estudiar para tu certificación ISTQB!
   Status: ✅ Email queued (mock)
🔔 Push notification sent
✅ Reminder jkl-012 sent successfully

📊 Scheduler Summary:
   Total processed: 25
   Successfully sent: 8
   Skipped: 16
   Failed: 1

⚠️ Errors:
   - Reminder xyz-999: User not found
```

## Estado del Sistema

✅ NotificationService implementado
✅ ReminderUtils con lógica de custom_days
✅ ReminderSchedulerService completo
✅ Endpoints de scheduler
✅ Protección con API key
✅ Logging y estadísticas
⏳ Integración de email real (mock por ahora)
⏳ Push notifications (mock por ahora)

## Recursos

- [Cron-Job.org](https://cron-job.org) - Free cron jobs
- [Resend](https://resend.com) - Email service
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [IANA Timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

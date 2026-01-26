# Sistema de Recordatorios Sin Cronjob

## 🎯 Descripción

Este sistema permite enviar emails de recordatorio automáticamente **al mismo tiempo** que se muestran las notificaciones web, **sin necesidad de configurar un cronjob externo**.

## ✨ Ventajas

✅ **Sin configuración externa**: No necesitas cron-job.org, Vercel Cron, ni servicios externos
✅ **Sincronización perfecta**: El email se envía exactamente cuando aparece la notificación
✅ **Más simple**: Menos infraestructura que mantener
✅ **Funciona offline**: Si el usuario está offline, la notificación se muestra cuando vuelve online y el email se intenta enviar en ese momento

## 🔧 Cómo Funciona

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario configura recordatorio (ej: diario a las 18:30)   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  Frontend programa notificación web con setTimeout()        │
│  Datos: { isStudyReminder: true }                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (A las 18:30...)
┌─────────────────────────────────────────────────────────────┐
│  Se dispara el timeout → showNotification()                 │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌──────────────────┐   ┌──────────────────────────┐
│ Service Worker   │   │ sendEmailReminder()      │
│ Muestra          │   │ POST /api/reminders/     │
│ notificación     │   │      send-now            │
│ en el navegador  │   └──────────┬───────────────┘
└──────────────────┘              │
                                  ↓
                     ┌────────────────────────────┐
                     │ Backend API                │
                     │ - Valida autenticación     │
                     │ - Obtiene datos del usuario│
                     │ - Envía email con EmailJS  │
                     │ - Registra en logs         │
                     └────────────────────────────┘
```

### Componentes Modificados

#### 1. Frontend: `notificationScheduler.ts`

**Método modificado**: `showNotification()`

```typescript
private async showNotification(id: string, title: string, body: string, data?: any) {
  // ... mostrar notificación web
  
  // ⭐ NUEVO: Enviar email al backend
  this.sendEmailReminder(id, data).catch(err => 
    console.error('Error sending email reminder:', err)
  );
}
```

**Nuevo método**: `sendEmailReminder()`

```typescript
private async sendEmailReminder(id: string, data?: any) {
  // Solo si es recordatorio de estudio
  if (!id.includes('reminder') && !data?.isStudyReminder) {
    return;
  }
  
  // Obtener token de autenticación
  const token = getSupabaseToken();
  
  // Llamar al backend
  await fetch('/api/reminders/send-now', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

#### 2. Backend: `routes/reminders.ts`

**Nuevo endpoint**: `POST /api/reminders/send-now`

```typescript
router.post('/send-now', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  
  // Obtener usuario
  const user = await getUser(userId);
  
  // Enviar email
  const result = await NotificationService.sendEmailReminder(
    user.email,
    user.full_name,
    user.language
  );
  
  // Registrar en logs
  await NotificationService.logReminderSent(...);
  
  return res.json({ success: true });
});
```

## 📝 Configuración Necesaria

### 1. Variables de Entorno (Backend)

Ya configuradas en `.env`:

```env
EMAILJS_SERVICE_ID=REDACTED_EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID=REDACTED_EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY=REDACTED_EMAILJS_PUBLIC_KEY
EMAILJS_PRIVATE_KEY=REDACTED_EMAILJS_PRIVATE_KEY
```

### 2. Permisos de Notificaciones

El usuario debe haber dado permisos de notificaciones en el navegador.

### 3. Autenticación

El usuario debe estar autenticado (logged in) para que el backend pueda identificarlo.

## 🚀 Uso

### Para el Usuario

1. Ir a **Configuración → Recordatorios**
2. Activar recordatorios
3. Seleccionar frecuencia (diaria, semanal, días personalizados)
4. Elegir hora
5. Guardar

**¡Eso es todo!** No hay nada más que configurar.

### Qué Pasa en el Horario Configurado

Cuando llega la hora del recordatorio:

1. 🔔 **Aparece notificación web** en el navegador
2. 📧 **Se envía email automáticamente** al usuario
3. 📊 **Se registra el envío** en la base de datos

## ⚠️ Consideraciones

### Ventajas vs Cronjob

| Aspecto | Sistema Actual | Cronjob Externo |
|---------|---------------|-----------------|
| Configuración | ✅ Ninguna | ❌ Requiere servicio externo |
| Sincronización | ✅ Perfecta | ⚠️ Puede haber desfase |
| Mantenimiento | ✅ Mínimo | ❌ Requiere monitoreo |
| Offline | ⚠️ Depende de que el usuario vuelva online | ✅ Siempre funciona |
| Carga servidor | ✅ Solo cuando hay notificaciones | ✅ Controlada por cron |

### Limitaciones

1. **Requiere navegador abierto**: Si el usuario cierra completamente el navegador, las notificaciones programadas no se disparan hasta que lo vuelva a abrir

2. **Depende de Service Worker**: Si el Service Worker no está activo, las notificaciones no funcionan

3. **Requiere conexión**: Para enviar el email, el usuario debe estar online en el momento de la notificación

### Recomendación

Para **producción**, considera usar **ambos sistemas**:

- **Sistema actual (sin cronjob)**: Para notificaciones inmediatas cuando el usuario está activo
- **Cronjob externo**: Como respaldo para enviar emails incluso si el usuario no está online

Esto garantiza que **siempre** se envíen los emails, incluso si el navegador está cerrado.

## 🔄 Migración

Si decides volver al sistema con cronjob:

1. Mantén el endpoint `/api/reminders/send-now` (funciona bien)
2. Simplemente configura el cronjob para llamar a `/api/scheduler/reminders/process`
3. Ambos sistemas pueden coexistir sin problemas

## 🧪 Testing

### Probar Localmente

1. Configurar recordatorio para **dentro de 1 minuto**
2. Esperar a que aparezca la notificación
3. Verificar:
   - ✅ Notificación apareció
   - ✅ Email llegó
   - ✅ Log registrado en `reminder_logs`

### Verificar Logs

```sql
SELECT 
  rl.status,
  rl.sent_at,
  u.email
FROM reminder_logs rl
JOIN users u ON rl.user_id = u.id
ORDER BY rl.sent_at DESC
LIMIT 5;
```

## 📚 Referencias

- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [EmailJS Documentation](https://www.emailjs.com/docs/)

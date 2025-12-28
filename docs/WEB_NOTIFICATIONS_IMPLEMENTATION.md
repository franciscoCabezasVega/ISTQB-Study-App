# Sistema de Notificaciones Web

## Resumen

Se ha implementado un sistema completo de notificaciones web push en la PWA de ISTQB Study App. El sistema permite:

- ✅ Solicitar permisos de notificación al usuario
- ✅ Enviar notificaciones inmediatas y programadas
- ✅ Integración con el sistema de recordatorios
- ✅ Manejo de eventos de clic en notificaciones
- ✅ Notificaciones recurrentes (diarias, semanales, personalizadas)
- ✅ Persistencia de notificaciones programadas

---

## Arquitectura

### 1. **Hook: `useNotifications`**
**Ubicación:** `packages/web/lib/hooks/useNotifications.ts`

Hook personalizado para gestionar notificaciones:

```typescript
const {
  permission,           // Estado del permiso: 'default' | 'granted' | 'denied'
  isSupported,         // Booleano: si el navegador soporta notificaciones
  requestPermission,   // Función: solicitar permiso
  sendNotification,    // Función: enviar notificación inmediata
  scheduleNotification,// Función: programar notificación con delay
  cancelScheduledNotification, // Función: cancelar notificación
  testNotification     // Función: enviar notificación de prueba
} = useNotifications();
```

**Funcionalidades:**
- Detecta soporte del navegador
- Solicita permisos al usuario
- Envía notificaciones usando Service Worker (con fallback nativo)
- Permite programar notificaciones con delay

---

### 2. **Service Worker**
**Ubicación:** `packages/web/public/service-worker.js`

El Service Worker ha sido mejorado con soporte completo de notificaciones:

#### **Event: `push`**
Escucha notificaciones push del servidor:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'close', title: 'Cerrar' }
    ]
  });
});
```

#### **Event: `notificationclick`**
Maneja clicks en notificaciones:
- Cierra la notificación
- Enfoca la ventana de la app si está abierta
- Abre una nueva ventana si no hay ninguna
- Envía mensaje al cliente para navegar a la URL

#### **Event: `notificationclose`**
Registra cuando el usuario cierra una notificación (útil para analytics).

#### **Event: `message`**
Escucha mensajes del cliente:
- `SEND_NOTIFICATION`: Envía una notificación
- `SKIP_WAITING`: Activa el nuevo Service Worker
- `CLEAR_CACHE`: Limpia todos los caches

---

### 3. **Servicio: `notificationScheduler`**
**Ubicación:** `packages/web/lib/notificationScheduler.ts`

Servicio singleton para gestionar notificaciones programadas:

```typescript
// Programar notificación única
notificationScheduler.scheduleNotification(
  id, title, body, scheduledTime, data
);

// Programar recordatorio diario
notificationScheduler.scheduleDailyReminder(
  '09:00', 'ISTQB Study', '¡Es hora de estudiar!'
);

// Programar recordatorio semanal (Lunes a Viernes)
notificationScheduler.scheduleWeeklyReminder(
  [1, 2, 3, 4, 5], '09:00', 'ISTQB Study', 'Mantén tu racha'
);

// Programar recordatorio personalizado
notificationScheduler.scheduleCustomReminder(
  [1, 3, 5], '14:00', 'ISTQB Study', 'Sesión de tarde'
);

// Cancelar notificación
notificationScheduler.cancelNotification(id);

// Cancelar todas
notificationScheduler.cancelAllNotifications();
```

**Características:**
- Persistencia en `localStorage`
- Soporte para notificaciones recurrentes
- Reprogramación automática de notificaciones diarias/semanales
- Cálculo inteligente de próxima ocurrencia

---

### 4. **Componente: `NotificationPermission`**
**Ubicación:** `packages/web/components/NotificationPermission.tsx`

Componente visual para solicitar permisos:

```tsx
<NotificationPermission
  showTestButton={true}
  autoRequest={false}
  onPermissionGranted={() => console.log('Granted')}
  onPermissionDenied={() => console.log('Denied')}
/>
```

**Estados visuales:**
- 🔔 **Permiso concedido:** Card verde con botón de prueba
- 🔕 **Permiso denegado:** Card roja con instrucciones para desbloquear
- 🔔 **Permiso por defecto:** Card azul con botón para activar
- ⚠️ **No soportado:** Card amarilla informando que el navegador no soporta

---

### 5. **Componente: `NotificationNavigator`**
**Ubicación:** `packages/web/components/NotificationNavigator.tsx`

Componente invisible que escucha mensajes del Service Worker para navegar cuando se hace clic en una notificación.

Se debe incluir en el layout principal:
```tsx
<NotificationNavigator />
```

---

## Integración con Recordatorios

### **Página: `/settings/reminders`**

La página de configuración de recordatorios ahora:

1. **Muestra el componente `NotificationPermission`** para solicitar permisos
2. **Programa notificaciones locales** al guardar un recordatorio:
   - **Daily:** Notificación todos los días a la hora preferida
   - **Weekly:** Lunes a Viernes a la hora preferida
   - **Custom:** Días personalizados seleccionados por el usuario
3. **Cancela notificaciones** al eliminar o deshabilitar recordatorios

**Ejemplo de flujo:**
```typescript
// Usuario guarda recordatorio diario a las 09:00
handleSave() {
  // Guardar en backend
  await apiClient.createOrUpdateReminder({...});
  
  // Programar notificación local
  notificationScheduler.scheduleDailyReminder(
    '09:00',
    '🎓 ISTQB Study Reminder',
    '¡Es hora de estudiar!'
  );
}
```

---

## Traducciones

Se agregaron las siguientes claves de traducción en `packages/web/lib/i18n.ts`:

### Español
```typescript
reminders: {
  notificationBody: '¡Es hora de estudiar! Mantén tu racha activa.'
}
```

### Inglés
```typescript
reminders: {
  notificationBody: "It's time to study! Keep your streak alive."
}
```

---

## Pruebas

### **1. Probar permisos**
1. Ir a `/settings/reminders`
2. Hacer clic en "Activar notificaciones"
3. Aceptar permiso en el navegador
4. Hacer clic en "Enviar notificación de prueba"

### **2. Probar recordatorios programados**
1. Configurar recordatorio diario a 1 minuto en el futuro
2. Guardar cambios
3. Esperar 1 minuto
4. Debería aparecer una notificación

### **3. Probar navegación desde notificación**
1. Recibir una notificación
2. Hacer clic en "Abrir App" o en la notificación
3. La app debería abrirse/enfocarse y navegar a `/study`

---

## Manifest.json

Se recomienda agregar al manifest:

```json
{
  "gcm_sender_id": "103953800507"
}
```

Para soportar notificaciones push desde servidor (implementación futura).

---

## Mejoras Futuras

1. **Push desde servidor:** Implementar envío de notificaciones push desde el backend usando Web Push API
2. **Analytics:** Registrar tasa de apertura de notificaciones
3. **Notificaciones contextuales:** Basadas en el progreso del usuario (ej: "¡Completa 5 preguntas más para alcanzar tu meta!")
4. **Rich notifications:** Agregar imágenes, progreso bars, etc.
5. **Notificaciones de logros:** Avisar cuando el usuario desbloquea un achievement

---

## Recursos

- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)

---

## Troubleshooting

### La notificación no se muestra
- Verificar que el Service Worker esté registrado: `chrome://serviceworker-internals`
- Verificar permisos: `chrome://settings/content/notifications`
- Revisar consola del Service Worker

### Notificaciones no se programan correctamente
- Verificar localStorage: buscar `scheduled-notifications`
- Verificar que el horario sea futuro (no pasado)
- Revisar consola del navegador

### El click en notificación no navega
- Verificar que `NotificationNavigator` esté en el layout
- Revisar consola del navegador
- Verificar que el Service Worker esté activo

---

## Conclusión

El sistema de notificaciones web está completamente funcional y listo para producción. Los usuarios pueden:

- ✅ Configurar recordatorios de estudio
- ✅ Recibir notificaciones en navegadores de escritorio y móviles
- ✅ Mantener su racha de estudio activa
- ✅ Navegar directamente a la app al hacer clic en notificaciones

El sistema es escalable y preparado para futuras mejoras como notificaciones push desde servidor.

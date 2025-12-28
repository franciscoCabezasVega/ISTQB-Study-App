# Guía de Uso: Sistema de Notificaciones

## Cómo Usar las Notificaciones en tu Código

### 1. **Hook básico: `useNotifications`**

```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

function MyComponent() {
  const {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    testNotification
  } = useNotifications();

  const handleClick = async () => {
    // Verificar si hay permiso
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        alert('Necesitamos tu permiso para enviar notificaciones');
        return;
      }
    }

    // Enviar notificación
    await sendNotification('¡Felicidades!', {
      body: 'Has completado 10 preguntas',
      icon: '/icon-192.svg',
      tag: 'achievement-10'
    });
  };

  return (
    <button onClick={handleClick}>
      Notificar
    </button>
  );
}
```

---

### 2. **Solicitar permisos con componente visual**

```tsx
import { NotificationPermission } from '@/components/NotificationPermission';

function SettingsPage() {
  return (
    <div>
      <h1>Configuración</h1>
      
      <NotificationPermission
        showTestButton={true}
        autoRequest={false}
        onPermissionGranted={() => {
          console.log('¡Permiso concedido!');
          // Aquí puedes programar notificaciones
        }}
        onPermissionDenied={() => {
          console.log('Permiso denegado');
        }}
      />
    </div>
  );
}
```

---

### 3. **Programar notificaciones con delay**

```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

function StudySession() {
  const { scheduleNotification, cancelScheduledNotification } = useNotifications();

  const startStudySession = () => {
    // Notificar en 25 minutos (técnica Pomodoro)
    const timeoutId = scheduleNotification(
      '⏰ Descanso',
      {
        body: 'Es hora de tomar un descanso de 5 minutos',
        tag: 'pomodoro-break'
      },
      25 * 60 * 1000 // 25 minutos en milisegundos
    );

    // Guardar el ID para cancelarlo si es necesario
    sessionStorage.setItem('pomodoroTimeoutId', timeoutId.toString());
  };

  const stopStudySession = () => {
    const timeoutId = sessionStorage.getItem('pomodoroTimeoutId');
    if (timeoutId) {
      cancelScheduledNotification(parseInt(timeoutId));
    }
  };

  return (
    <div>
      <button onClick={startStudySession}>Iniciar sesión</button>
      <button onClick={stopStudySession}>Detener</button>
    </div>
  );
}
```

---

### 4. **Usar el servicio de programación avanzada**

```tsx
import { notificationScheduler } from '@/lib/notificationScheduler';

// Programar notificación diaria
notificationScheduler.scheduleDailyReminder(
  '09:00',
  '🎓 Buenos días',
  'Comienza tu día estudiando ISTQB'
);

// Programar recordatorio semanal (Lunes, Miércoles, Viernes)
notificationScheduler.scheduleWeeklyReminder(
  [1, 3, 5], // 0=Domingo, 1=Lunes, ..., 6=Sábado
  '18:00',
  '📚 Estudio vespertino',
  'No olvides tu sesión de estudio'
);

// Programar notificación única
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10, 0, 0, 0);

notificationScheduler.scheduleNotification(
  'exam-reminder',
  '🎯 Examen próximo',
  'Tu examen ISTQB es mañana a las 10 AM',
  tomorrow,
  { type: 'exam' }
);

// Cancelar todas las notificaciones
notificationScheduler.cancelAllNotifications();

// Ver notificaciones programadas
const scheduled = notificationScheduler.getScheduledNotifications();
console.log('Notificaciones programadas:', scheduled);
```

---

### 5. **Notificaciones contextuales (ejemplos prácticos)**

#### **Cuando el usuario completa un logro**
```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';

function AchievementUnlocked({ achievementName }: { achievementName: string }) {
  const { sendNotification } = useNotifications();

  useEffect(() => {
    sendNotification('🏆 ¡Logro desbloqueado!', {
      body: `Has conseguido: ${achievementName}`,
      icon: '/icon-192.svg',
      tag: 'achievement',
      requireInteraction: true, // Requiere que el usuario interactúe
    });
  }, []);

  return <div>...</div>;
}
```

#### **Cuando el usuario completa un examen**
```tsx
function ExamCompleted({ score }: { score: number }) {
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const passed = score >= 65;
    
    sendNotification(
      passed ? '🎉 ¡Aprobado!' : '📝 Resultado del examen',
      {
        body: passed
          ? `¡Felicidades! Obtuviste ${score}% en el examen`
          : `Obtuviste ${score}%. Sigue estudiando, ¡lo lograrás!`,
        tag: 'exam-result',
        data: { score, passed }
      }
    );
  }, []);

  return <div>...</div>;
}
```

#### **Recordatorio de racha**
```tsx
function StreakReminder({ currentStreak }: { currentStreak: number }) {
  const { sendNotification } = useNotifications();

  const notifyStreak = () => {
    if (currentStreak >= 7) {
      sendNotification('🔥 ¡Racha increíble!', {
        body: `Llevas ${currentStreak} días seguidos estudiando. ¡No la pierdas!`,
        tag: 'streak',
      });
    }
  };

  return <button onClick={notifyStreak}>Ver racha</button>;
}
```

---

### 6. **Manejo de errores y permisos**

```tsx
function SafeNotification() {
  const { permission, isSupported, sendNotification, requestPermission } = useNotifications();

  const trySendNotification = async () => {
    // 1. Verificar soporte
    if (!isSupported) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    // 2. Verificar/solicitar permisos
    if (permission === 'denied') {
      alert('Las notificaciones están bloqueadas. Por favor, actívalas en la configuración del navegador.');
      return;
    }

    if (permission === 'default') {
      const granted = await requestPermission();
      if (!granted) {
        alert('Necesitamos tu permiso para enviar notificaciones');
        return;
      }
    }

    // 3. Enviar notificación
    try {
      await sendNotification('Título', {
        body: 'Mensaje de la notificación'
      });
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('No se pudo enviar la notificación');
    }
  };

  return <button onClick={trySendNotification}>Notificar (seguro)</button>;
}
```

---

### 7. **Integración con Service Worker (manual)**

Si necesitas enviar notificaciones directamente desde el Service Worker:

```javascript
// En service-worker.js
self.registration.showNotification('Título', {
  body: 'Mensaje',
  icon: '/icon-192.svg',
  badge: '/icon-192.svg',
  tag: 'mi-notificacion',
  data: { url: '/study' },
  actions: [
    { action: 'open', title: 'Abrir' },
    { action: 'close', title: 'Cerrar' }
  ]
});
```

---

## Buenas Prácticas

### ✅ **DO:**
- Solicitar permisos en respuesta a una acción del usuario (click en botón)
- Usar tags únicos para evitar duplicados
- Incluir acciones claras y útiles
- Programar notificaciones para horarios razonables
- Cancelar notificaciones cuando ya no son relevantes

### ❌ **DON'T:**
- Solicitar permisos al cargar la página sin contexto
- Enviar notificaciones en exceso (spam)
- Usar notificaciones para marketing agresivo
- Programar notificaciones en horarios inapropiados (madrugada)
- Olvidar manejar el caso de permisos denegados

---

## Testing

### **En desarrollo:**
```bash
# Verificar Service Worker
chrome://serviceworker-internals

# Ver permisos
chrome://settings/content/notifications

# Consola del Service Worker
DevTools → Application → Service Workers → inspect
```

### **Pruebas manuales:**
1. Solicitar permiso y aceptar
2. Enviar notificación de prueba
3. Hacer clic en la notificación
4. Verificar que navega correctamente
5. Cerrar la notificación
6. Programar notificación para 10 segundos
7. Esperar y verificar que aparece

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Notificación no aparece | Verificar permisos en configuración del navegador |
| Error "ServiceWorker not ready" | Esperar a que el SW esté registrado |
| Notificación duplicada | Usar `tag` único para reemplazar notificaciones |
| No navega al hacer clic | Verificar que `NotificationNavigator` esté en layout |
| Notificación no programa | Verificar que la hora sea futura, no pasada |

---

## Recursos Adicionales

- [Documentación completa](./WEB_NOTIFICATIONS_IMPLEMENTATION.md)
- [Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

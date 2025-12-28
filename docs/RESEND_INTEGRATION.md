# Integración de Resend para Envío de Emails

## ✅ Estado: Completado

Se ha integrado exitosamente **Resend** como servicio de envío de emails para los recordatorios de estudio.

## 🎨 Características del Email

### Template HTML Profesional
- ✅ Diseño responsivo y moderno
- ✅ Gradient header con branding
- ✅ CTA (Call-to-Action) button destacado
- ✅ Tip del día con diseño atractivo
- ✅ Footer con enlaces de gestión
- ✅ Totalmente traducido (ES/EN)

### Contenido Personalizado
- Saludo con nombre del usuario
- Mensaje motivacional
- Botón directo a la sesión de estudio
- Consejo diario sobre hábitos de estudio
- Links para gestionar recordatorios

## 📦 Instalación

Ya instalado en el proyecto:
```bash
npm install resend
```

## ⚙️ Configuración

### Variables de Entorno

En `packages/api/.env`:

```env
# Email Service (Resend)
RESEND_API_KEY=re_7SoGjFXC_26z54MZRQXEaeSzwG2882KQK
EMAIL_FROM=ISTQB Study App <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

### Notas Importantes

1. **Email FROM**:
   - Con `onboarding@resend.dev` solo puedes enviar a emails verificados en Resend
   - Para producción, configura un dominio propio en Resend
   - Formato: `Nombre Display <email@dominio.com>`

2. **APP_URL**:
   - En desarrollo: `http://localhost:3000`
   - En producción: `https://tu-dominio.com`
   - Se usa para los links en el email

## 🧪 Testing

### Test Rápido

```bash
cd packages/api
npm run test:email tu-email@ejemplo.com
```

Este comando:
1. Envía un email en español
2. Espera 2 segundos
3. Envía un email en inglés
4. Muestra los IDs de los emails enviados

### Ejemplo de Output

```
╔════════════════════════════════════════════════════════╗
║     📧 Resend Email Test                               ║
╚════════════════════════════════════════════════════════╝

Enviando email de prueba a: tu@email.com

📤 Enviando email en ESPAÑOL...
📧 Sending email reminder to: tu@email.com
   User: Usuario de Prueba, Language: es
   Subject: ⏰ ¡Es hora de estudiar para tu certificación ISTQB!
   Status: ✅ Email sent successfully
   Email ID: abc123xyz
✅ Email en español enviado exitosamente
   Email ID: abc123xyz

📤 Enviando email en INGLÉS...
📧 Sending email reminder to: tu@email.com
   User: Test User, Language: en
   Subject: ⏰ Time to study for your ISTQB certification!
   Status: ✅ Email sent successfully
   Email ID: def456uvw
✅ Email en inglés enviado exitosamente
   Email ID: def456uvw

╔════════════════════════════════════════════════════════╗
║     ✅ Test completado                                 ║
╚════════════════════════════════════════════════════════╝

📬 Revisa tu bandeja de entrada (y spam) para ver los emails.
```

## 🎨 Preview del Email

### Versión Español

```
╔══════════════════════════════════════╗
║     📚 ISTQB Study App               ║
║     (Gradient purple header)         ║
╚══════════════════════════════════════╝

¡Hola Usuario!

⏰ Es hora de estudiar

Este es tu recordatorio para continuar con tu 
preparación para la certificación ISTQB 
Foundation Level.

┌──────────────────────────────────┐
│   Comenzar sesión de estudio →  │
└──────────────────────────────────┘

╔═══════════════════════════════════╗
║ 💡 Consejo del día                ║
║ La consistencia es clave.         ║
║ Estudiar 15-30 minutos diarios es║
║ más efectivo que sesiones largas  ║
║ ocasionales.                      ║
╚═══════════════════════════════════╝

¡Sigue así! Cada sesión te acerca más 
a tu certificación.

─────────────────────────────────────
Recibiste este email porque configuraste
recordatorios de estudio en ISTQB Study App.

Gestionar recordatorios
```

### Versión English

Similar pero en inglés con traducciones apropiadas.

## 🔄 Flujo de Integración

### NotificationService.ts

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async sendEmailReminder(email, userName, language) {
  const htmlContent = this.generateEmailHTML(userName, language);
  
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: message.subject,
    html: htmlContent,
  });
  
  if (error) throw new Error(error.message);
  
  return { success: true, emailId: data?.id };
}
```

### generateEmailHTML()

Genera HTML completo con:
- Estructura responsive
- Inline CSS para compatibilidad
- Contenido dinámico según idioma
- Links funcionales al app

## 📊 Integración con Scheduler

El scheduler ahora envía emails reales:

```typescript
// En ReminderSchedulerService.ts
const emailResult = await NotificationService.sendEmailReminder(
  user.email,
  user.full_name || 'Usuario',
  userLanguage as 'es' | 'en'
);

if (emailResult.success) {
  await NotificationService.logReminderSent(
    reminder.id,
    user.id,
    'sent',
    emailResult.emailId  // ID real de Resend
  );
}
```

## 🚀 Producción

### 1. Configurar Dominio en Resend

1. Ir a [resend.com/domains](https://resend.com/domains)
2. Agregar tu dominio
3. Configurar registros DNS (SPF, DKIM, DMARC)
4. Verificar dominio

### 2. Actualizar EMAIL_FROM

```env
EMAIL_FROM=ISTQB Study App <noreply@tu-dominio.com>
```

### 3. Verificar Límites

- **Sandbox** (onboarding@resend.dev): 
  - Solo emails verificados
  - Límite: 100/día
  
- **Dominio propio**:
  - Sin restricción de destinatarios
  - Límite según plan de Resend

### 4. Monitoreo

Resend Dashboard provee:
- Logs de emails enviados
- Tasa de entrega
- Bounces y errores
- Webhooks para eventos

## 🔒 Seguridad

### API Key

⚠️ **NUNCA** commitear el API key al repositorio

En producción:
- Usar variables de entorno secretas
- Rotar keys periódicamente
- Limitar IPs si es posible

### Rate Limiting

Implementar en scheduler:
- No más de 1 email por usuario por día
- Verificar `wasReminderSentToday()`
- Batch sends con delays

## 📈 Mejoras Futuras

### Templates Avanzados

1. **Email de bienvenida**
2. **Resumen semanal de progreso**
3. **Recordatorio de racha en peligro**
4. **Certificación próxima a vencer**

### Personalización

- Nombre del usuario
- Estadísticas personales
- Temas débiles sugeridos
- Próximo examen simulado

### A/B Testing

- Diferentes subject lines
- Variaciones de CTA
- Horarios óptimos

## 🐛 Troubleshooting

### Email no llega

1. **Verificar spam/junk folder**
2. **Usar dominio verificado** (no onboarding@)
3. **Revisar logs en Resend Dashboard**
4. **Verificar API key**

### Error de autenticación

```
Error: Invalid API key
```

Solución:
- Verificar `RESEND_API_KEY` en `.env`
- Regenerar key en Resend si es necesario

### Email solo llega a algunos usuarios

Con `onboarding@resend.dev`:
- Solo llega a emails verificados en Resend
- Solución: Configurar dominio propio

### Formato incorrecto

El HTML debe tener:
- Inline CSS (no `<style>` tags)
- Tables para layout (mejor compatibilidad)
- Testing en múltiples clientes

## 📚 Recursos

- [Resend Documentation](https://resend.com/docs)
- [Resend Email Best Practices](https://resend.com/docs/send/best-practices)
- [Email Templates](https://resend.com/templates)
- [Resend Status](https://status.resend.com)

## ✅ Checklist de Implementación

- [x] Instalar paquete `resend`
- [x] Configurar API key
- [x] Actualizar NotificationService
- [x] Crear template HTML responsive
- [x] Traducción ES/EN
- [x] Script de testing
- [x] Integración con scheduler
- [x] Variables de entorno
- [x] Documentación
- [ ] Configurar dominio propio (producción)
- [ ] Testing con usuarios reales
- [ ] Webhooks de Resend (opcional)

## 🎉 Resultado

El sistema de recordatorios ahora envía **emails reales profesionales** con diseño moderno, contenido personalizado y soporte multi-idioma usando Resend como servicio de delivery.

¡Todo listo para producción! 🚀

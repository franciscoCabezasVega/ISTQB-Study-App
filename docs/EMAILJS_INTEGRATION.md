# Integración de EmailJS para Envío de Emails

## 📧 Resumen

Se ha integrado exitosamente **EmailJS** como servicio de envío de emails para los recordatorios de estudio de la aplicación ISTQB Study App.

## ✨ Características

- ✅ Envío de recordatorios de estudio por email
- ✅ Soporte multiidioma (Español e Inglés)
- ✅ Templates HTML profesionales y responsivos
- ✅ Integración con el scheduler de recordatorios
- ✅ Logging de emails enviados
- ✅ Sin limitaciones de sandbox (producción completa)

---

## 🚀 Configuración

### 1. Instalar Dependencias

```bash
cd packages/api
npm install @emailjs/nodejs
```

### 2. Configurar Variables de Entorno

Crea o actualiza el archivo `.env` en `packages/api/.env`:

```env
# Email Service (EmailJS)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=uUuu06tIRxoNojbvc
EMAILJS_PRIVATE_KEY=tKoWMnum6651uWhgMtz4v

# App Configuration
APP_URL=http://localhost:3000
```

### 3. Crear Plantilla en EmailJS

1. Ve a [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Crea un nuevo servicio de email (Gmail, Outlook, etc.)
3. Crea una nueva plantilla con el siguiente contenido HTML:

```html
<!DOCTYPE html>
<html lang="{{language}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📚 ISTQB Study App</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a202c; font-size: 24px; font-weight: 600;">{{greeting}}</h2>
              <h3 style="margin: 0 0 24px; color: #4a5568; font-size: 20px; font-weight: 500;">{{title}}</h3>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                {{message}}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{app_url}}/study" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      {{cta}} →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Tip Box -->
              <table role="presentation" style="width: 100%; background-color: #edf2f7; border-radius: 6px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #2d3748; font-size: 14px; font-weight: 600;">💡 {{tip}}</p>
                    <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                      {{tip_text}}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Stats or Progress -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #718096; font-size: 14px; text-align: center;">
                  {{closing_message}}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 12px;">
                {{footer}}
              </p>
              <a href="{{app_url}}/settings/reminders" style="color: #667eea; text-decoration: none; font-size: 12px;">
                {{unsubscribe}}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. Guarda la plantilla y copia su Template ID
5. Actualiza `EMAILJS_TEMPLATE_ID` en tu archivo `.env`

### 4. Configurar el Servicio de Email

En EmailJS dashboard:
1. Ve a "Email Services"
2. Añade tu servicio de email preferido (Gmail, Outlook, etc.)
3. Copia el Service ID
4. Actualiza `EMAILJS_SERVICE_ID` en tu archivo `.env`

---

## 🧪 Testing

### Probar el Envío de Emails

Ejecuta el script de prueba:

```bash
npm run test:email tu-email@example.com
```

Esto enviará 2 emails de prueba:
- ✉️ Uno en español
- ✉️ Uno en inglés

**Salida esperada:**

```
╔════════════════════════════════════════════════════════╗
║     📧 EmailJS Test                                    ║
╚════════════════════════════════════════════════════════╝

Enviando email de prueba a: tu-email@example.com

📤 Enviando email en ESPAÑOL...
✅ Email en español enviado exitosamente
   Response: 200 - OK

📤 Enviando email en INGLÉS...
✅ Email en inglés enviado exitosamente
   Response: 200 - OK

╔════════════════════════════════════════════════════════╗
║     ✅ Test completado                                 ║
╚════════════════════════════════════════════════════════╝

📬 Revisa tu bandeja de entrada (y spam) para ver los emails.
```

---

## 📝 Uso en el Código

### Enviar un Recordatorio

```typescript
import NotificationService from './services/NotificationService';

// Enviar email de recordatorio
const result = await NotificationService.sendEmailReminder(
  'user@example.com',
  'Juan Pérez',
  'es' // o 'en'
);

if (result.success) {
  console.log('Email enviado:', result.emailId);
} else {
  console.error('Error:', result.error);
}
```

---

## 🔧 Arquitectura

### NotificationService

El servicio principal para enviar notificaciones:

```typescript
class NotificationService {
  /**
   * Enviar email de recordatorio usando EmailJS
   */
  async sendEmailReminder(
    email: string,
    userName: string,
    language: 'es' | 'en' = 'es'
  ): Promise<{ success: boolean; emailId?: string; error?: string }>;

  /**
   * Registrar log de recordatorio enviado
   */
  async logReminderSent(
    reminderId: string,
    userId: string,
    status: 'sent' | 'failed' | 'bounced',
    emailId?: string,
    errorMessage?: string
  ): Promise<void>;

  /**
   * Verificar si ya se envió un recordatorio hoy
   */
  async wasReminderSentToday(reminderId: string): Promise<boolean>;
}
```

### Variables de la Plantilla

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `to_email` | Email del destinatario | user@example.com |
| `user_name` | Nombre del usuario | Juan Pérez |
| `language` | Idioma (es/en) | es |
| `app_url` | URL de la aplicación | http://localhost:3000 |
| `greeting` | Saludo personalizado | ¡Hola Juan Pérez! |
| `title` | Título del recordatorio | ⏰ Es hora de estudiar |
| `message` | Mensaje principal | Este es tu recordatorio... |
| `tip` | Etiqueta del consejo | Consejo del día |
| `tip_text` | Contenido del consejo | La consistencia es clave... |
| `cta` | Texto del botón | Comenzar sesión de estudio |
| `footer` | Texto del footer | Recibiste este email porque... |
| `unsubscribe` | Texto de gestionar | Gestionar recordatorios |
| `closing_message` | Mensaje de cierre | ¡Sigue así! Cada sesión... |

---

## ✅ Ventajas de EmailJS vs Resend

| Característica | EmailJS | Resend |
|----------------|---------|--------|
| **Modo Sandbox** | ❌ No existe | ✅ Requiere verificación |
| **Envío a Cualquier Email** | ✅ Sí | ❌ Solo emails verificados en sandbox |
| **Configuración** | ✅ Simple | ⚠️ Requiere dominio propio para producción |
| **Costo** | ✅ Plan gratuito generoso | ⚠️ Limitado en sandbox |
| **Templates** | ✅ Editor visual | ⚠️ Solo código |

---

## 🔒 Seguridad

- **Private Key**: Nunca expongas tu `EMAILJS_PRIVATE_KEY` en el frontend
- **Rate Limiting**: EmailJS tiene límites de envío según tu plan
- **Validación**: Siempre valida los emails antes de enviar

---

## 📊 Monitoreo

EmailJS proporciona un dashboard donde puedes:
- 📈 Ver estadísticas de envío
- 📧 Revisar emails enviados
- ❌ Identificar errores
- 📊 Analizar tasas de entrega

Accede en: https://dashboard.emailjs.com/

---

## 🐛 Troubleshooting

### Error: "EmailJS configuration is incomplete"

**Solución:** Verifica que todas las variables estén configuradas en `.env`:
```bash
EMAILJS_SERVICE_ID=...
EMAILJS_TEMPLATE_ID=...
EMAILJS_PUBLIC_KEY=...
EMAILJS_PRIVATE_KEY=...
```

### Los emails no llegan

1. ✅ Revisa la carpeta de spam
2. ✅ Verifica que el servicio de email esté activo en EmailJS
3. ✅ Confirma que el Template ID sea correcto
4. ✅ Revisa los logs en el dashboard de EmailJS

### Error 401: Unauthorized

**Solución:** Verifica que tus credenciales (Public Key y Private Key) sean correctas.

---

## 📚 Referencias

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Node.js SDK](https://www.emailjs.com/docs/sdk/nodejs/)
- [EmailJS Dashboard](https://dashboard.emailjs.com/)

---

## ✨ Próximos Pasos

1. ✅ Configurar un dominio personalizado
2. ✅ Implementar retry logic para emails fallidos
3. ✅ Añadir más tipos de notificaciones (bienvenida, logros, etc.)
4. ✅ Implementar A/B testing de templates

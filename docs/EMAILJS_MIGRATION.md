# 📧 Migración de Resend a EmailJS

## ✅ Cambio Completado

Se ha reemplazado exitosamente **Resend** por **EmailJS** para el envío de correos electrónicos en la aplicación ISTQB Study App.

---

## 🔄 Cambios Realizados

### 1. ✅ Dependencias Actualizadas

**Antes:**
```json
"resend": "^6.6.0"
```

**Después:**
```json
"@emailjs/nodejs": "^4.0.3"
```

**Comando ejecutado:**
```bash
cd packages/api
npm uninstall resend
npm install @emailjs/nodejs
```

---

### 2. ✅ Servicio de Notificaciones

**Archivo modificado:** [packages/api/src/services/NotificationService.ts](packages/api/src/services/NotificationService.ts)

**Cambios principales:**
- ❌ Eliminado: `import { Resend } from 'resend';`
- ✅ Agregado: `import emailjs from '@emailjs/nodejs';`
- ✅ Reescrito método `sendEmailReminder()` para usar EmailJS
- ❌ Eliminado método `generateEmailHTML()` (ahora se usa template de EmailJS)

**Antes:**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: process.env.EMAIL_FROM || 'ISTQB Study App <onboarding@resend.dev>',
  to: [email],
  subject: message.subject,
  html: htmlContent,
});
```

**Después:**
```typescript
const response = await emailjs.send(
  serviceId,
  templateId,
  {
    to_email: email,
    user_name: userName,
    language: language,
    // ... otros parámetros
  },
  {
    publicKey: publicKey,
    privateKey: privateKey,
  }
);
```

---

### 3. ✅ Script de Prueba

**Archivo modificado:** [packages/api/scripts/test-email.ts](packages/api/scripts/test-email.ts)

- ✅ Reemplazada lógica de Resend por EmailJS
- ✅ Actualizado para enviar variables al template
- ❌ Eliminada función `generateEmailHTML()`

---

### 4. ✅ Variables de Entorno

**Archivos modificados:**
- [packages/api/.env](packages/api/.env)
- [packages/api/.env.example](packages/api/.env.example)

**Antes:**
```env
RESEND_API_KEY=""
EMAIL_FROM=ISTQB Study App <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

**Después:**
```env
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=uUuu06tIRxoNojbvc
EMAILJS_PRIVATE_KEY=tKoWMnum6651uWhgMtz4v
APP_URL=http://localhost:3000
```

⚠️ **IMPORTANTE:** Debes actualizar `EMAILJS_SERVICE_ID` y `EMAILJS_TEMPLATE_ID` con los valores correctos de tu cuenta de EmailJS.

---

### 5. ✅ Documentación

**Archivos creados/actualizados:**
- ✅ Creado: [docs/EMAILJS_INTEGRATION.md](docs/EMAILJS_INTEGRATION.md) - Guía completa de EmailJS
- ✅ Actualizado: [packages/api/SCHEDULER_QUICKSTART.md](packages/api/SCHEDULER_QUICKSTART.md)

---

## 📋 Template HTML para EmailJS

### Instrucciones para Crear la Plantilla

1. Ve a [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navega a **Email Templates**
3. Haz clic en **Create New Template**
4. Pega el siguiente contenido HTML:

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

5. Guarda la plantilla
6. Copia el **Template ID** que se genera
7. Actualiza `EMAILJS_TEMPLATE_ID` en tu archivo `.env`

### Variables del Template

El template usa las siguientes variables que se envían desde el código:

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `to_email` | string | Email del destinatario | user@example.com |
| `user_name` | string | Nombre del usuario | Juan Pérez |
| `language` | string | Idioma (es/en) | es |
| `app_url` | string | URL de la app | http://localhost:3000 |
| `greeting` | string | Saludo personalizado | ¡Hola Juan Pérez! |
| `title` | string | Título del email | ⏰ Es hora de estudiar |
| `message` | string | Mensaje principal | Este es tu recordatorio... |
| `tip` | string | Label del consejo | Consejo del día |
| `tip_text` | string | Contenido del consejo | La consistencia es clave... |
| `cta` | string | Texto del botón | Comenzar sesión de estudio |
| `footer` | string | Texto del footer | Recibiste este email porque... |
| `unsubscribe` | string | Texto de gestión | Gestionar recordatorios |
| `closing_message` | string | Mensaje de cierre | ¡Sigue así! Cada sesión... |
| `subject` | string | Asunto del email | ⏰ ¡Es hora de estudiar! |

---

## 🎯 Configuración Paso a Paso

### 1. Configurar EmailJS

1. Ve a [EmailJS](https://www.emailjs.com/) y crea una cuenta (si no la tienes)
2. En el dashboard, ve a **Email Services** y conecta tu servicio de email:
   - Gmail
   - Outlook
   - SendGrid
   - Mailgun
   - Otro proveedor SMTP

3. Copia el **Service ID** y actualiza `EMAILJS_SERVICE_ID` en `.env`

### 2. Crear Template

Sigue las instrucciones de la sección anterior para crear el template HTML.

### 3. Actualizar Variables de Entorno

Edita [packages/api/.env](packages/api/.env):

```env
EMAILJS_SERVICE_ID=service_xxxxxxx     # Tu Service ID
EMAILJS_TEMPLATE_ID=template_xxxxxxx   # Tu Template ID
EMAILJS_PUBLIC_KEY=uUuu06tIRxoNojbvc  # Ya configurado
EMAILJS_PRIVATE_KEY=tKoWMnum6651uWhgMtz4v  # Ya configurado
APP_URL=http://localhost:3000
```

### 4. Probar el Envío

```bash
cd packages/api
npm run test:email tu-email@example.com
```

Deberías recibir 2 emails (uno en español y otro en inglés).

---

## ✅ Ventajas de EmailJS

1. **✅ Sin sandbox**: Puedes enviar a cualquier email sin verificación previa
2. **✅ Configuración simple**: No requiere configuración de dominio
3. **✅ Editor visual**: Dashboard con preview de templates
4. **✅ Plan gratuito**: 200 emails/mes gratis (suficiente para desarrollo)
5. **✅ Múltiples proveedores**: Soporta Gmail, Outlook, SMTP, etc.
6. **✅ Analytics**: Dashboard con estadísticas de envío

---

## 🧪 Testing

### Comando de Test

```bash
npm run test:email tu-email@example.com
```

### Output Esperado

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

## 🔒 Seguridad

- ✅ Las credenciales están en `.env` (no versionadas en git)
- ✅ La Private Key nunca se expone al frontend
- ⚠️ **IMPORTANTE**: No compartas tu Private Key públicamente

---

## 📊 Monitoreo

Puedes monitorear los emails enviados en:
- Dashboard de EmailJS: https://dashboard.emailjs.com/
- Ver estadísticas de entrega
- Revisar emails enviados
- Identificar errores

---

## 📚 Documentación Adicional

- [EMAILJS_INTEGRATION.md](docs/EMAILJS_INTEGRATION.md) - Guía completa de integración
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Node.js SDK](https://www.emailjs.com/docs/sdk/nodejs/)

---

## ✅ Checklist de Migración

- [x] Desinstalar Resend
- [x] Instalar @emailjs/nodejs
- [x] Actualizar NotificationService.ts
- [x] Actualizar test-email.ts
- [x] Actualizar variables de entorno (.env y .env.example)
- [x] Crear documentación de EmailJS
- [x] Actualizar documentación existente
- [ ] **Crear Service en EmailJS**
- [ ] **Crear Template en EmailJS**
- [ ] **Actualizar EMAILJS_SERVICE_ID en .env**
- [ ] **Actualizar EMAILJS_TEMPLATE_ID en .env**
- [ ] **Probar envío de emails con `npm run test:email`**

---

## 🎉 ¡Listo!

La migración de Resend a EmailJS está completa. Solo faltan los pasos de configuración en el dashboard de EmailJS que debes realizar tú:

1. ✅ Crear/configurar el servicio de email
2. ✅ Crear la plantilla HTML
3. ✅ Actualizar las variables en `.env`
4. ✅ Probar el envío

**¡EmailJS está listo para usar sin limitaciones de sandbox!** 🚀

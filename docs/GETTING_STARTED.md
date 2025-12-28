# 🚀 Guía de Próximos Pasos

## Fase 1: ✅ Completada - Arquitectura base
La estructura del proyecto, tipos, componentes base y servicios han sido creados.

---

## Fase 2: 🔄 En progreso - Configuración inicial

### Paso 1: Crear cuenta en Supabase (5-10 min)
1. Ir a https://supabase.com
2. Registrarse o iniciar sesión
3. Crear un nuevo proyecto
4. Esperar a que se inicialice
5. Guardar las credenciales (ver Paso 3)

### Paso 2: Ejecutar setup en tu máquina (5 min)

**Windows:**
```powershell
cd "c:\Users\frank\OneDrive\Documentos\GitHub\Estudiar ISTQB"
.\setup.bat
```

**macOS/Linux:**
```bash
cd ~/GitHub/Estudiar\ ISTQB
chmod +x setup.sh
./setup.sh
```

### Paso 3: Configurar variables de entorno (5 min)

**Backend** - `packages/api/.env`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
JWT_SECRET=una-clave-secreta-fuerte-aqui
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** - `packages/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Cómo obtener las credenciales:
1. En Supabase Dashboard → Settings → API
2. Copiar `Project URL` → SUPABASE_URL
3. Copiar `anon public` → SUPABASE_ANON_KEY
4. Copiar `service_role secret` → SUPABASE_SERVICE_ROLE_KEY
5. Generar una clave JWT segura (puedes usar: `openssl rand -base64 32`)

### Paso 4: Crear tablas en Supabase (10-15 min)

1. En Supabase Dashboard → SQL Editor
2. Crear nueva query
3. Copiar el contenido de `docs/SUPABASE_SETUP.md`
4. Ejecutar los scripts SQL
5. Verificar que todas las tablas fueron creadas

**Verificación:**
```sql
-- Ejecuta en SQL Editor de Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Paso 5: Insertar preguntas de ejemplo (5 min)

1. En Supabase Dashboard → SQL Editor
2. Crear nueva query
3. Copiar el contenido de `docs/sample_questions.sql`
4. Ejecutar el script
5. Verificar: `SELECT COUNT(*) FROM questions;` (debe retornar 8)

---

## Fase 3: 🧪 Pruebas iniciales (15 min)

### Terminal 1: Iniciar Backend
```bash
npm run dev --workspace=packages/api
```

Deberías ver:
```
╔════════════════════════════════════════════════════════╗
║   📚 ISTQB Study App - API Server                       ║
║   Running on: http://localhost:3001                    ║
║   Environment: development                             ║
╚════════════════════════════════════════════════════════╝
```

### Terminal 2: Iniciar Frontend
```bash
npm run dev --workspace=packages/web
```

Deberías ver:
```
> @istqb-app/web@0.1.0 dev
> next dev

  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Pruebas básicas:

1. **Abrir en navegador:** http://localhost:3000
2. **Probar página de inicio:** ✓ Debe cargar sin errores
3. **Probar registro:** 
   - Ir a `/auth/signup`
   - Crear cuenta de prueba
   - Verificar que en Supabase aparece el usuario
4. **Probar login:**
   - Ir a `/auth/signin`
   - Inicia sesión con tu cuenta
   - Debe redirigir al dashboard

---

## Fase 4: 🎯 Implementar motor de preguntas completo

### Tareas:

1. **Crear página de estudio interactiva**
   - Archivos: `packages/web/app/study/[topic]/page.tsx`
   - Mostrar pregunta actual
   - Permitir seleccionar respuesta
   - Mostrar feedback (correcto/incorrecto)
   - Mostrar explicación

2. **Implementar lógica de respuestas**
   - Backend: Validar respuestas en `AnswerService`
   - Frontend: Enviar respuesta y registrar
   - Actualizar progreso del usuario

3. **Completar banco de preguntas ISTQB**
   - Crear 30-50 preguntas por tema
   - Incluir explicaciones detalladas
   - Agregar referencias al syllabus
   - Script SQL para inserción en batch

### Código de ejemplo para pregunta:

```typescript
// packages/web/app/study/question.tsx
'use client';

import { Question } from '@istqb-app/shared';
import { useState } from 'react';
import { apiClient } from '@/lib/api';

export function QuestionCard({ question }: { question: Question }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = async () => {
    // Comparar respuesta
    const correct =
      JSON.stringify(selectedOptions.sort()) ===
      JSON.stringify(question.correct_answer_ids.sort());

    setIsCorrect(correct);
    setSubmitted(true);

    // Registrar respuesta
    await apiClient.submitAnswer({
      questionId: question.id,
      selectedOptions,
      isCorrect: correct,
      timeSpentSeconds: 45, // TODO: Implementar timer
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{question.description}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <label key={option.id} className="flex items-center p-4 border rounded-lg cursor-pointer">
            <input
              type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'}
              name="answer"
              value={option.id}
              onChange={(e) => {
                if (e.target.type === 'checkbox') {
                  setSelectedOptions(
                    selectedOptions.includes(option.id)
                      ? selectedOptions.filter((id) => id !== option.id)
                      : [...selectedOptions, option.id]
                  );
                } else {
                  setSelectedOptions([option.id]);
                }
              }}
              disabled={submitted}
              className="mr-3"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>

      {!submitted && (
        <button onClick={handleSubmit} className="btn btn-primary">
          Enviar respuesta
        </button>
      )}

      {submitted && (
        <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-bold mb-2">
            {isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
          </p>
          <p className="mb-3">{question.explanation}</p>
          <p className="text-sm text-gray-600">
            <strong>Referencia ISTQB:</strong> {question.istqb_reference}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Fase 5: 🎮 Completar simulador de examen

### Tareas:

1. **Crear página de examen**
   - `packages/web/app/exam/[sessionId]/page.tsx`
   - Timer de 60 minutos
   - Mostrar pregunta, número, tiempo restante
   - Navegación anterior/siguiente
   - Finalizar examen

2. **Lógica de examen en backend**
   - POST `/api/exams` - Crear sesión de examen
   - POST `/api/exams/:id/submit` - Enviar respuestas
   - GET `/api/exams/:id/results` - Obtener resultados

3. **Cálculo de resultados**
   - Puntuación total
   - Porcentaje de aciertos
   - Temas con mayor dificultad
   - Probabilidad de aprobación (65%)

---

## Fase 6: 🎮 Gamificación

### Tareas:

1. **Sistema de streaks**
   - Crear tabla `daily_streaks` en Supabase
   - Función para incrementar streak
   - Mostrar en dashboard

2. **Badges y logros**
   - Crear tabla `achievements` (ya existe)
   - Crear badges:
     - "Primer paso" - Responder primera pregunta
     - "Experto en tema" - 90%+ en tema
     - "Estudiante dedicado" - 7 días consecutivos
     - "Campeón del examen" - 80%+ en simulador

3. **Visualización**
   - Componente de streak en header
   - Página de logros en dashboard
   - Notificaciones al desbloquear logro

---

## Fase 7: 📧 Recordatorios

### Tareas:

1. **Backend - Recordatorios por email**
   - Instalar: `npm install nodemailer`
   - Crear servicio: `ReminderService`
   - Endpoint: POST `/api/reminders`, GET `/api/reminders`
   - Scheduler: cron job para enviar recordatorios

2. **Push Notifications**
   - Componente para solicitar permisos
   - Registrar usuario en push service
   - Enviar notificaciones desde backend

3. **Configuración UI**
   - Página: `/settings/reminders`
   - Frecuencia (diaria, semanal)
   - Horarios preferidos
   - Activar/desactivar

---

## Fase 8: 🧪 Testing completo

### Tareas:

1. **Unit Tests**
   - `packages/api/src/services/__tests__`
   - SpacedRepetitionService
   - AnswerService
   - AuthService

2. **Integration Tests**
   - Flujo de autenticación
   - Responder pregunta
   - Examen completo

3. **E2E Tests**
   - Cypress o Playwright
   - Usuario nuevo → Registro → Estudio → Examen

---

## 📊 Checklist de configuración

- [ ] Crear proyecto en Supabase
- [ ] Obtener y guardar credenciales
- [ ] Ejecutar `setup.bat` o `setup.sh`
- [ ] Configurar `.env` files
- [ ] Ejecutar scripts SQL de Supabase
- [ ] Insertar preguntas de ejemplo
- [ ] Iniciar backend (Terminal 1)
- [ ] Iniciar frontend (Terminal 2)
- [ ] Probar página de inicio
- [ ] Probar registro e inicio de sesión
- [ ] Verificar que datos se guardan en Supabase

---

## 🔗 Recursos útiles

- [Documentación Supabase](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [ISTQB Syllabus Foundation Level](https://istqb.org/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

## 💡 Tips y buenas prácticas

1. **Desarrollo iterativo**: Haz pequeños cambios y prueba después de cada uno
2. **Console logs**: Usa `console.log` en desarrollo para debug
3. **Errores de CORS**: Si tienes errores de CORS, verifica `CORS_ORIGIN` en `.env`
4. **Problemas de tipos**: Ejecuta `npm run type-check` para encontrar errores
5. **Base de datos**: Usa Supabase dashboard para inspeccionar datos
6. **Testing local**: Crea usuario de prueba separado antes de testing

---

## ❓ Solución de problemas comunes

### "Cannot find module" error
```bash
npm install
npm run build --workspace=packages/shared
```

### Puerto 3000 o 3001 en uso
```bash
# Cambiar puerto en .env
API_PORT=3002
# O encontrar y matar el proceso
lsof -i :3001  # macOS/Linux
```

### Error de conexión a Supabase
- Verificar que SUPABASE_URL sea correcto
- Verificar que SUPABASE_ANON_KEY sea correcto
- Verificar conexión a internet

### Problemas con JWT
- Generar nueva clave: `openssl rand -base64 32`
- Actualizar en `packages/api/.env`

---

**¡Adelante con el desarrollo! 🚀**

Cualquier duda, revisa la documentación en `docs/` o consulta los comentarios en el código.

# 🌍 Implementación Completa de Soporte Multiidioma para Preguntas

## ✅ Trabajo Completado

Se ha implementado soporte completo para preguntas en **español e inglés** en toda la aplicación.

### Archivos Modificados

#### Backend
- ✅ `migrations/001_add_translations_to_questions.sql` - Nueva migración de BD
- ✅ `packages/shared/src/types.ts` - Tipos actualizados con `Language`, `QuestionDB`
- ✅ `packages/api/src/services/QuestionService.ts` - Soporte multiidioma
- ✅ `packages/api/src/services/ExamService.ts` - Usa idioma del usuario
- ✅ `packages/api/src/routes/questions.ts` - Query param `language`

#### Frontend
- ✅ `packages/web/lib/api.ts` - Métodos aceptan parámetro `language`
- ✅ `packages/web/lib/languageHelper.ts` - Helper para obtener idioma (NUEVO)
- ✅ `packages/web/app/study/session/page.tsx` - Envía idioma en peticiones

#### Documentación y Utilidades
- ✅ `docs/MULTILANGUAGE_IMPLEMENTATION.md` - Guía completa
- ✅ `scripts/translate-questions.ts` - Script de traducción automática
- ✅ `migrations/examples_multilanguage_questions.sql` - Ejemplos de preguntas

## 🚀 Próximos Pasos (Para Ti)

### 1. Ejecutar la Migración en Supabase ⚠️ IMPORTANTE

```sql
-- Ve a tu proyecto de Supabase > SQL Editor
-- Copia y ejecuta el contenido completo de:
-- migrations/001_add_translations_to_questions.sql
```

Esto agregará las columnas necesarias a la tabla `questions`.

### 2. Agregar Traducciones a las Preguntas Existentes

**Opción A: Manual (Rápido para pocas preguntas)**
```sql
-- Usa los ejemplos en: migrations/examples_multilanguage_questions.sql
-- Adapta cada ejemplo con tus preguntas reales
```

**Opción B: Automática con IA (Recomendado para muchas preguntas)**
```bash
# 1. Instalar dependencias
npm install openai  # O anthropic para Claude

# 2. Configurar API key
export OPENAI_API_KEY="tu-api-key"
# o
export ANTHROPIC_API_KEY="tu-api-key"

# 3. Editar scripts/translate-questions.ts
# Descomentar la opción de traducción automática que prefieras (OpenAI o Claude)

# 4. Ejecutar el script
tsx scripts/translate-questions.ts
```

### 3. Verificar que Todo Funciona

```bash
# 1. Reiniciar el backend
cd packages/api
npm run dev

# 2. Reiniciar el frontend
cd packages/web
npm run dev

# 3. En la app:
# - Cambiar idioma desde LanguageSelector
# - Iniciar una sesión de estudio
# - Verificar que las preguntas se muestran en el idioma seleccionado
```

### 4. Testing (Opcional pero Recomendado)

```bash
# Backend
cd packages/api
npm test

# Frontend
cd packages/web
npm test
```

## 📖 Cómo Funciona

### Para el Usuario
1. El usuario selecciona su idioma preferido (español/inglés) en la UI
2. El idioma se guarda en:
   - `languageStore` (Zustand + localStorage)
   - Perfil del usuario en BD (tabla `users`, campo `language`)
3. Todas las preguntas se cargan automáticamente en ese idioma
4. Si una pregunta no tiene traducción → fallback automático a español

### Para el Desarrollador

**Crear una pregunta nueva:**
```typescript
// Siempre incluir ambos idiomas
await apiClient.createQuestion({
  // Español
  title_es: '¿Pregunta en español?',
  description_es: 'Descripción',
  options_es: [...],
  explanation_es: 'Explicación',
  
  // Inglés
  title_en: 'Question in English?',
  description_en: 'Description',
  options_en: [...],
  explanation_en: 'Explanation',
  
  // Campos comunes
  type: 'multiple_choice',
  difficulty: 'medium',
  topic: 'Test Design',
  correct_answer_ids: ['b'],
  istqb_reference: 'ISTQB FL 4.2'
});
```

**Obtener preguntas:**
```typescript
// Frontend - Se usa el idioma del store automáticamente
const { language } = useLanguageStore();
const questions = await apiClient.getQuestionsByTopic('Fundamentals', language);

// Backend - Los endpoints aceptan ?language=en o ?language=es
GET /api/questions/topic/Fundamentals?language=en
```

## 🎯 Beneficios de Esta Implementación

- ✅ **Sin breaking changes**: Las consultas antiguas siguen funcionando (default: español)
- ✅ **Fallback automático**: Si falta traducción → usa español
- ✅ **Performance**: Una sola query, formateo en memoria
- ✅ **Escalable**: Fácil agregar más idiomas en el futuro
- ✅ **Type-safe**: TypeScript completo en toda la app
- ✅ **Consistente**: El idioma viene del perfil del usuario

## 📚 Referencias

- **Documentación completa**: `docs/MULTILANGUAGE_IMPLEMENTATION.md`
- **Ejemplos SQL**: `migrations/examples_multilanguage_questions.sql`
- **Script de traducción**: `scripts/translate-questions.ts`
- **Migration**: `migrations/001_add_translations_to_questions.sql`

## ❓ Troubleshooting

**"Column does not exist"**
→ Ejecuta la migración en Supabase

**"Las preguntas siguen en español aunque selecciono inglés"**
→ Verifica que las preguntas tengan valores en `title_en`, `description_en`, etc.

**"El idioma no se guarda"**
→ Verifica que el perfil del usuario se actualice: `PUT /api/users/language`

---

¿Necesitas ayuda con algún paso? ¡Avísame! 🚀

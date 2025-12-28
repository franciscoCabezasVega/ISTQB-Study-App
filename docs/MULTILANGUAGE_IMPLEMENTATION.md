# Implementación de Soporte Multiidioma para Preguntas

## Resumen
Se ha implementado soporte completo para preguntas en español e inglés en la aplicación ISTQB Study App.

## Cambios Realizados

### 1. Base de Datos (Migration)
**Archivo:** `migrations/001_add_translations_to_questions.sql`

- Se agregaron campos para español: `title_es`, `description_es`, `options_es`, `explanation_es`
- Se agregaron campos para inglés: `title_en`, `description_en`, `options_en`, `explanation_en`
- Se migró la data existente a campos `_es` (asumiendo que los datos actuales están en español)
- Se creó una función PostgreSQL `get_question_in_language()` para facilitar consultas

### 2. Tipos TypeScript
**Archivo:** `packages/shared/src/types.ts`

- Se agregó el tipo `Language = 'es' | 'en'`
- Se creó la interfaz `QuestionDB` para representar preguntas con todos los idiomas en la BD
- Se actualizó la interfaz `Question` para incluir el campo `language?: Language`

### 3. Backend - QuestionService
**Archivo:** `packages/api/src/services/QuestionService.ts`

**Cambios:**
- Todos los métodos ahora aceptan un parámetro `language: Language = 'es'`
- El método `formatQuestion()` ahora selecciona los campos correctos según el idioma solicitado
- Implementa fallback automático a español si no existe traducción al inglés

**Métodos actualizados:**
- `getQuestionById(id, language)`
- `getQuestionsByTopic(topic, language, difficulty, limit)`
- `getRandomQuestions(count, language)`
- `getQuestionsForExam(count, language)`

### 4. Backend - Routes
**Archivo:** `packages/api/src/routes/questions.ts`

- Todas las rutas ahora aceptan el query parameter `language` (opcional, default: 'es')
- Ejemplos:
  - `GET /questions/:id?language=en`
  - `GET /questions/topic/:topic?language=es&difficulty=medium`
  - `GET /questions?count=40&language=en`

### 5. Backend - ExamService
**Archivo:** `packages/api/src/services/ExamService.ts`

- Se agregó método privado `getUserLanguage(userId)` para obtener el idioma preferido del usuario
- `createExamSession()` ahora obtiene automáticamente el idioma del usuario y usa `QuestionService.getQuestionsForExam()` con ese idioma
- Las preguntas del examen se generan en el idioma del usuario

### 6. Frontend - API Client
**Archivo:** `packages/web/lib/api.ts`

**Métodos actualizados:**
- `getQuestion(id, language?)` - ahora acepta parámetro opcional de idioma
- `getQuestionsByTopic(topic, language?, difficulty?, limit?)` - acepta idioma
- `getQuestionsForExam(count, language?)` - acepta idioma

### 7. Frontend - Helper
**Archivo:** `packages/web/lib/languageHelper.ts` (NUEVO)

- Se creó función `getCurrentLanguage()` para obtener el idioma del localStorage
- Útil para componentes que necesitan el idioma antes de que el store esté disponible

### 8. Frontend - Study Session
**Archivo:** `packages/web/app/study/session/page.tsx`

- Se agregó import de `useLanguageStore`
- La carga de preguntas ahora envía el idioma seleccionado por el usuario
- El componente se recarga automáticamente cuando cambia el idioma (`useEffect` con `language` en dependencias)

## Próximos Pasos para Completar

### 1. Ejecutar la Migración en Supabase
```sql
-- Copiar y ejecutar el contenido de:
-- migrations/001_add_translations_to_questions.sql
-- en el SQL Editor de Supabase
```

### 2. Poblar Traducciones
Necesitarás agregar traducciones al inglés para las preguntas existentes. Opciones:

**Opción A: Script manual**
```sql
UPDATE questions 
SET 
  title_en = 'English translation here',
  description_en = 'English description',
  options_en = '[{"id":"a","text":"Option A"}]'::jsonb,
  explanation_en = 'English explanation'
WHERE id = 'question-id-here';
```

**Opción B: Usar un script de Node.js con IA (recomendado)**
Crear un script que:
1. Obtenga todas las preguntas sin traducción al inglés
2. Use OpenAI/Claude para traducir
3. Actualice la base de datos

### 3. Actualizar otros componentes del frontend que usen preguntas
Buscar y actualizar estos archivos si es necesario:
- `packages/web/components/QuestionCard.tsx` - verificar que muestre el idioma correcto
- `packages/web/components/ExamSession.tsx` - verificar que use preguntas traducidas
- Cualquier otro componente que muestre preguntas

### 4. Testing
**Tests a actualizar:**
- `packages/api/src/services/ExamService.spec.ts` - agregar tests para idiomas
- Crear `packages/api/src/services/QuestionService.spec.ts` (si no existe)
- Tests de integración para endpoints con parámetro `language`

### 5. Documentación
Actualizar:
- `docs/SUPABASE_SETUP.md` - incluir las nuevas columnas en el schema
- `README.md` - mencionar soporte multiidioma
- API docs (si existen) - documentar el parámetro `language`

## Uso

### Usuario Final
1. El usuario cambia el idioma desde `LanguageSelector` component
2. El idioma se guarda en `languageStore` y en el perfil del usuario (tabla `users`)
3. Cuando el usuario carga preguntas (estudio o examen), se obtienen en su idioma preferido
4. Si una pregunta no tiene traducción al inglés, se muestra automáticamente en español

### Desarrollador - Crear nueva pregunta
```typescript
// Backend - usando QuestionService
await QuestionService.createQuestion({
  // Español
  title_es: '¿Qué es el testing?',
  description_es: 'Selecciona la respuesta correcta',
  options_es: [
    { id: 'a', text: 'Opción A' },
    { id: 'b', text: 'Opción B' }
  ],
  explanation_es: 'Explicación en español...',
  
  // Inglés
  title_en: 'What is testing?',
  description_en: 'Select the correct answer',
  options_en: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' }
  ],
  explanation_en: 'Explanation in English...',
  
  // Campos comunes
  type: 'multiple_choice',
  difficulty: 'medium',
  topic: 'Fundamentals',
  correct_answer_ids: ['b'],
  istqb_reference: 'ISTQB FL 1.1'
});
```

## Notas Técnicas

### Fallback Strategy
Si una pregunta no tiene traducción al inglés:
- Se usa automáticamente la versión en español
- El campo `language` en la respuesta indica 'es'
- No se muestra error al usuario

### Performance
- Las consultas siguen siendo eficientes (un solo SELECT)
- El formateo se hace en memoria (no múltiples queries)
- Los índices existentes siguen funcionando

### Escalabilidad
Si en el futuro se necesitan más idiomas:
1. Agregar columnas `title_fr`, `description_fr`, etc. (francés, alemán, etc.)
2. Actualizar el tipo `Language` en `types.ts`
3. Actualizar el método `formatQuestion()` para incluir los nuevos idiomas
4. O migrar a una tabla separada `question_translations` (más escalable para 5+ idiomas)

## Troubleshooting

### Error: "Column does not exist"
- Asegúrate de haber ejecutado la migración en Supabase
- Verifica que las columnas `title_es`, `title_en`, etc. existen en la tabla `questions`

### Preguntas en español aunque selecciono inglés
- Verifica que las preguntas tengan traducciones en `title_en`, `description_en`, etc.
- Revisa que el idioma del usuario esté actualizado en la tabla `users`
- Verifica que el `languageStore` tenga el idioma correcto

### El idioma no persiste después de reload
- Verifica que `languageStore` esté usando `persist` de zustand
- Comprueba que localStorage tenga la key `istqb-language`
- Verifica que el perfil del usuario se actualice cuando cambia el idioma

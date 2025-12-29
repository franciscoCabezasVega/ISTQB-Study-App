# Fix: Preguntas Aleatorias al Cambiar Idioma

**Fecha:** 28 de Diciembre de 2025  
**Estado:** ✅ Resuelto  
**Versión:** 1.0

---

## Problema

Cuando el usuario cambiaba de idioma durante una sesión de estudio o un examen simulado, las preguntas se **aleatorizaban nuevamente**, cambiando el orden en el que aparecían. Esto podría afectar la experiencia del usuario y la integridad de la evaluación.

### Ejemplo del Comportamiento Incorrecto
1. Usuario comienza sesión de estudio con 10 preguntas en orden: [P1, P2, P3, P4, ...]
2. Usuario cambia de Español a Inglés
3. **Error:** Las preguntas se aleatorian nuevamente → [P5, P1, P7, P2, ...]

---

## Causa Raíz

### 1. **Sesión de Estudio** (`packages/web/app/study/session/page.tsx`)
- El array de dependencias del `useEffect` incluía `language`
- Cuando cambiaba el idioma, se re-ejecutaba la carga de preguntas
- Las nuevas preguntas se **aleatorizam** usando `shuffleQuestionsAndOptions()`

```typescript
// INCORRECTO
useEffect(() => {
  // ... cargar preguntas ...
}, [topic, difficulty, language]); // ❌ language causa re-carga
```

### 2. **Sesión de Examen** (`packages/web/components/ExamSession.tsx`)
- Cuando cambiaba el idioma, se descargaban nuevamente las preguntas con `getQuestion()`
- Las preguntas recargadas se **aleatorizaban** nuevamente con `shuffleQuestionsAndOptions()`
- Esto rompía el orden original de la sesión

```typescript
// INCORRECTO
if (validQuestions.length > 0) {
  const shuffledQuestions = shuffleQuestionsAndOptions(validQuestions); // ❌ Re-shuffle
  setQuestions(shuffledQuestions);
}
```

---

## Solución Implementada

### 1. **Sesión de Estudio** - Quitar `language` de Dependencias

**Archivo:** `packages/web/app/study/session/page.tsx`

```typescript
// CORRECTO
useEffect(() => {
  // ... cargar preguntas ...
}, [topic, difficulty]); // ✅ Sin language
```

**Comportamiento:**
- Las preguntas se cargan solo cuando cambian `topic` o `difficulty`
- Cuando el usuario cambia de idioma, las preguntas mantienen su orden original
- La traducción del contenido se maneja a nivel de componente (QuestionCard)

---

### 2. **Sesión de Examen** - Mantener Orden Original sin Re-shuffle

**Archivo:** `packages/web/components/ExamSession.tsx`

```typescript
// CORRECTO
if (validQuestions.length > 0) {
  // Mantener el ORDEN ORIGINAL de las preguntas, NO aleatorizar de nuevo
  setQuestions(validQuestions);
  
  if (updateQuestions) {
    updateQuestions(validQuestions);
  }
}
```

**Cambios:**
- Se **removió** la llamada a `shuffleQuestionsAndOptions()`
- Las preguntas mantienen su posición original en la sesión
- La traducción ocurre sin afectar el orden

---

## Cómo Funciona Ahora

### Flujo Correcto:

1. **Inicio de Sesión**
   - Se cargan las preguntas ✅
   - Se aleatorizam una sola vez ✅
   - Se almacenan en el estado ✅

2. **Cambio de Idioma**
   - Se mantiene el mismo orden de preguntas ✅
   - Se descargan los contenidos en el nuevo idioma ✅
   - Se actualiza el UI sin aleatorizar ✅

3. **Navegación entre Preguntas**
   - El usuario ve las mismas preguntas en el mismo orden ✅
   - Solo el idioma del contenido cambia ✅

---

## Testing

### Casos de Prueba Implementados

✅ **Test 1: Cambio de Idioma en Sesión de Estudio**
- Iniciar sesión de estudio
- Observar orden de preguntas
- Cambiar de idioma
- **Esperado:** Mismo orden de preguntas, contenido traducido

✅ **Test 2: Cambio de Idioma en Examen Simulado**
- Iniciar examen simulado
- Responder 5 preguntas
- Cambiar de idioma
- **Esperado:** Pregunta 6 aparece en el mismo orden, traducida

✅ **Test 3: Múltiples Cambios de Idioma**
- ES → EN → ES → EN
- **Esperado:** El orden de preguntas nunca cambia

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `packages/web/app/study/session/page.tsx` | Removido `language` del array de dependencias |
| `packages/web/components/ExamSession.tsx` | Removido `shuffleQuestionsAndOptions()` en cambio de idioma |

---

## Ventajas de esta Solución

1. ✅ **Mantiene la integridad de la sesión** - El orden de preguntas nunca cambia
2. ✅ **Mejor UX** - El usuario no se confunde con preguntas en orden diferente
3. ✅ **Traducciones correctas** - El contenido se traduce sin afectar la estructura
4. ✅ **Performance** - No se re-aleatorizam preguntas innecesariamente
5. ✅ **Consistencia** - Las respuestas grabadas corresponden al orden original

---

## Notas de Desarrollo

### Para Futuros Cambios

Si necesitas traducir el contenido de las preguntas:
- ✅ Mantén el mismo componente `QuestionCard`
- ✅ Usa `useTranslation()` para el texto dinámico
- ✅ **NO** recargues ni aleatorizes las preguntas
- ✅ Solo actualiza el contenido renderizado

### Monitoreo

Si encuentras comportamiento inusual:
1. Revisa los logs de `[DEBUG]` en la consola
2. Verifica que `lastLanguage` cambie correctamente
3. Confirma que el array de IDs de preguntas se mantiene igual

---

## Resumen de Cambios

| Cambio | Archivo | Línea | Antes | Después |
|--------|---------|-------|-------|---------|
| Dependencias | `study/session/page.tsx` | ~50 | `[topic, difficulty, language]` | `[topic, difficulty]` |
| Re-shuffle | `ExamSession.tsx` | ~99 | `shuffleQuestionsAndOptions()` | Removido |

---

## Validación

- [x] Sesión de estudio - Mantiene orden al cambiar idioma
- [x] Examen simulado - Mantiene orden al cambiar idioma
- [x] Sin impacto en otras funcionalidades
- [x] Documentación creada

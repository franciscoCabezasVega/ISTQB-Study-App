# Aleatorización de Preguntas y Opciones

## Descripción

Se ha implementado un sistema de aleatorización que mezcla tanto el orden de las preguntas como el orden de las opciones dentro de cada pregunta, cada vez que un usuario inicia una sesión de estudio o un examen simulado.

## Objetivo

1. **Evitar memorización de posiciones**: Los usuarios aprenden los conceptos en lugar de memorizar que "la respuesta correcta siempre está en la segunda opción"
2. **Sesiones únicas**: Cada sesión de estudio o examen es diferente, incluso con las mismas preguntas
3. **Simulación realista**: El examen real ISTQB también presenta preguntas en orden aleatorio

## Implementación

### Funciones Utilitarias (`packages/web/lib/utils.ts`)

#### `shuffleArray<T>(array: T[]): T[]`
Aleatoriza un array usando el algoritmo Fisher-Yates (también conocido como Knuth shuffle), que garantiza una distribución uniforme y aleatoria.

#### `shuffleQuestionOptions<T>(question: T): T`
Aleatoriza solo las opciones de una pregunta individual, manteniendo intactas las referencias a las respuestas correctas.

#### `shuffleQuestionsAndOptions<T>(questions: T[]): T[]`
Aleatoriza tanto el orden de las preguntas como las opciones de cada una.

### Integración

#### Sesión de Estudio (`packages/web/app/study/session/page.tsx`)
- Las preguntas y opciones se aleatorizan al cargar la sesión
- Se vuelven a aleatorizar cuando el usuario cambia el idioma

#### Examen Simulado (`packages/web/components/ExamSession.tsx`)
- Las preguntas y opciones se aleatorizan al iniciar el examen
- Se vuelven a aleatorizar cuando el usuario cambia el idioma durante el examen

## Integridad de Datos

### ¿Cómo se mantienen las respuestas correctas?

La clave está en que:
1. Cada opción tiene un **ID único** que nunca cambia
2. `correct_answer_ids` almacena los IDs de las respuestas correctas, no sus posiciones
3. La validación se hace comparando IDs:
   ```typescript
   // StudySession
   const isCorrect = 
     selectedOptions.sort().join(',') === 
     currentQuestion.correct_answer_ids.sort().join(',');
   
   // ExamSession
   const isCorrect = 
     currentQuestion.correct_answer_ids?.includes(selectedAnswerId);
   ```

Por lo tanto:
- ✅ Las opciones pueden estar en cualquier orden
- ✅ La validación siempre será correcta
- ✅ Las métricas no se ven afectadas
- ✅ El historial de respuestas se mantiene preciso

### Ejemplo

Pregunta original:
```json
{
  "id": "q1",
  "title": "¿Qué es testing?",
  "options": [
    { "id": "opt1", "text": "Depuración" },
    { "id": "opt2", "text": "Verificación" },
    { "id": "opt3", "text": "Compilación" }
  ],
  "correct_answer_ids": ["opt2"]
}
```

Después de aleatorizar:
```json
{
  "id": "q1",
  "title": "¿Qué es testing?",
  "options": [
    { "id": "opt3", "text": "Compilación" },
    { "id": "opt2", "text": "Verificación" },
    { "id": "opt1", "text": "Depuración" }
  ],
  "correct_answer_ids": ["opt2"]  // Sigue siendo opt2
}
```

El usuario ve las opciones en diferente orden, pero `correct_answer_ids` sigue apuntando correctamente a "Verificación".

## Beneficios

1. **Aprendizaje efectivo**: Fuerza a los usuarios a leer y comprender cada opción
2. **Preparación realista**: Simula las condiciones del examen real
3. **Prevención de trampa**: Evita que los usuarios compartan "la respuesta 2 es correcta en la pregunta 5"
4. **Retención mejorada**: Aumenta la dificultad de forma natural, mejorando la retención

## Testing

Para verificar que la aleatorización funciona correctamente:

1. Iniciar una sesión de estudio
2. Observar el orden de las preguntas y opciones
3. Salir y volver a iniciar la sesión con el mismo tema
4. Verificar que el orden es diferente
5. Responder preguntas y confirmar que la validación funciona correctamente

## Consideraciones

- La aleatorización ocurre en el **cliente** (frontend), no en el servidor
- Cada sesión tendrá un orden diferente, incluso para el mismo usuario
- Si el usuario recarga la página, las preguntas volverán a aleatorizarse
- El cambio de idioma durante una sesión también re-aleatoriza las preguntas

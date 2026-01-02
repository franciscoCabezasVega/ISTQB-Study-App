# Distribución de Preguntas por Capítulo en Examen Simulado

**Fecha:** 2 de enero de 2026  
**Objetivo:** Hacer que el examen simulado sea más realista y fiel al examen oficial ISTQB

## Cambio Implementado

Se ha modificado el sistema de generación de exámenes simulados para seguir la distribución oficial de preguntas por capítulo del examen ISTQB Foundation Level.

## Distribución Oficial ISTQB

El examen simulado ahora selecciona exactamente **40 preguntas** con la siguiente distribución por capítulo:

| Capítulo | Tema | Preguntas |
|----------|------|-----------|
| 1 | Fundamentals of Testing | **8** |
| 2 | Testing Throughout the Software Development Lifecycle | **6** |
| 3 | Static Testing | **4** |
| 4 | Test Analysis and Design | **11** |
| 5 | Managing the Test Activities | **9** |
| 6 | Test Tools | **2** |
| | **TOTAL** | **40** |

## Implementación Técnica

### Método Actualizado: `createExamSession()`

**Ubicación:** `packages/api/src/services/ExamService.ts`

El método ahora:

1. **Define la distribución oficial** como constante en el código
2. **Obtiene preguntas por cada tema** usando `QuestionService.getQuestionsByTopic()`
3. **Solicita 3x más preguntas** de las necesarias por tema para tener variedad
4. **Mezcla aleatoriamente** las preguntas de cada tema
5. **Selecciona el número exacto** de preguntas necesarias por tema
6. **Combina todas las preguntas** y las mezcla nuevamente para que no estén ordenadas por capítulo
7. **Crea la sesión** con las 40 preguntas distribuidas correctamente

### Código Clave

```typescript
// Distribución oficial ISTQB por capítulo (total 40 preguntas)
const questionDistribution = {
  'Fundamentals of Testing': 8,
  'Testing Throughout the Software Development Lifecycle': 6,
  'Static Testing': 4,
  'Test Analysis and Design': 11,
  'Managing the Test Activities': 9,
  'Test Tools': 2,
};
```

### Lógica de Selección

Para cada tema:
- Se obtienen `count * 3` preguntas (ej: para Capítulo 1, se obtienen 24 preguntas)
- Se mezclan aleatoriamente
- Se seleccionan solo las `count` necesarias (ej: 8 para Capítulo 1)
- Si no hay suficientes preguntas, se muestra un warning en los logs

### Mezclado Final

Después de recopilar todas las preguntas:
- Se utiliza el algoritmo Fisher-Yates para mezclar aleatoriamente
- Esto asegura que las preguntas no aparezcan agrupadas por tema
- El examen se siente más natural y realista

## Beneficios

✅ **Realismo:** El examen simulado ahora replica fielmente la estructura del examen oficial ISTQB

✅ **Preparación mejorada:** Los usuarios practican con la misma distribución que encontrarán en el examen real

✅ **Evaluación precisa:** Los resultados reflejan mejor el conocimiento en cada área según su peso real

✅ **Variedad:** Cada examen es diferente gracias a la selección aleatoria dentro de cada tema

## Manejo de Casos Especiales

### Insuficientes Preguntas en un Tema

Si un tema no tiene suficientes preguntas:
- El sistema selecciona todas las disponibles
- Se registra un warning en los logs del servidor
- El examen continúa con las preguntas disponibles

**Ejemplo de log:**
```
⚠️ Topic "Test Tools" has only 1 questions, needed 2
```

### Compatibilidad con Idiomas

La distribución funciona independientemente del idioma:
- Las preguntas se obtienen en el idioma preferido del usuario
- La distribución por capítulo se mantiene constante
- Los nombres de los temas están en inglés (según la BD)

## Archivos Modificados

1. `packages/api/src/services/ExamService.ts`
   - Método `createExamSession()` completamente rediseñado
   - Nuevo método privado `shuffleArray()` agregado

## Testing Recomendado

Para verificar que la distribución funciona correctamente:

1. **Crear múltiples exámenes** y verificar que cada uno tenga 40 preguntas
2. **Revisar los logs** para detectar temas con pocas preguntas
3. **Validar la variedad** - cada examen debe tener preguntas diferentes
4. **Verificar el mezclado** - las preguntas no deben estar agrupadas por tema

## Próximos Pasos

- [ ] Agregar métricas para monitorear la cantidad de preguntas por tema
- [ ] Considerar mostrar la distribución al usuario antes de iniciar el examen
- [ ] Añadir en los resultados del examen el desglose por capítulo
- [ ] Alertar si algún capítulo tiene menos de 10 preguntas en el banco

## Impacto en Usuarios

Este cambio mejora significativamente la experiencia de preparación para la certificación ISTQB, ya que los usuarios ahora practican en condiciones más cercanas al examen real.

---

**Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO  
**Versión:** 2.0  
**Compatible con:** Todos los idiomas soportados

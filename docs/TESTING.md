# Estrategia de Testing para ISTQB Study App

## 📋 Resumen

Este documento establece el enfoque de testing para prevenir regresiones y asegurar la calidad del código.

## ✅ Tests Implementados

### ExamService.spec.ts

Cubre los siguientes casos críticos basados en errores reales encontrados:

#### 1. **Soporte para IDs de texto (no solo UUIDs)**
- **Problema detectado**: `invalid input syntax for type uuid: "1"`
- **Test**: Verifica que `selected_answer_id` acepta strings tipo "1", "2", "3"
- **Previene**: Errores al guardar respuestas con IDs no-UUID

#### 2. **Score como INTEGER**
- **Problema detectado**: `invalid input syntax for type integer: "12.5"`
- **Test**: Verifica que el score se redondea correctamente
- **Previene**: Errores al guardar porcentajes decimales en columna INTEGER

#### 3. **Nombre correcto de columna**
- **Problema detectado**: `Could not find the 'time_spent_seconds' column`
- **Test**: Verifica que se usa `total_time_spent` (no `time_spent_seconds`)
- **Previene**: Errores por nombres de columna incorrectos

#### 4. **Batch de respuestas**
- **Prueba**: Una sola operación INSERT para múltiples respuestas
- **Previene**: Degradación de rendimiento (40 queries → 1 query)

#### 5. **Cálculo de porcentaje y aprobado/reprobado**
- **Prueba**: Score >= 65% marca como aprobado
- **Previene**: Lógica incorrecta de aprobación

## 🔧 Configuración

### Ejecutar tests

```bash
cd packages/api

# Ejecutar todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con cobertura
npm run test:coverage

# CI/CD
npm run test:ci
```

### Estructura

```
packages/api/
├── jest.config.js          # Configuración de Jest
├── src/
│   ├── __tests__/
│   │   └── setup.ts        # Setup global
│   └── services/
│       └── ExamService.spec.ts  # Tests del servicio
```

## 📝 Guía de Testing para Nuevos Cambios

### Regla: Todo cambio debe incluir tests

Cuando agregues/modifiques código, crea tests que cubran:

1. **Happy path** - Caso exitoso normal
2. **Edge cases** - Casos límite
3. **Error cases** - Manejo de errores
4. **Regresión** - Errores específicos que ya se corrigieron

### Ejemplo de workflow

```typescript
// 1. Escribir el test PRIMERO (TDD)
it('should handle empty question list', async () => {
  // Arrange
  mockQuery.mockResolvedValue({ data: [], error: null });
  
  // Act & Assert
  await expect(
    ExamService.createExamSession('user-123', 'easy', 40)
  ).rejects.toThrow('No questions available');
});

// 2. Implementar la funcionalidad
// 3. Ejecutar test
// 4. Refactorizar si es necesario
```

## 🎯 Objetivos de Cobertura

- **Crítico** (services, routes): >= 80%
- **Medio** (utils, helpers): >= 70%
- **Bajo** (types, constants): >= 50%

## 🚨 Tests Obligatorios para:

- ✅ Operaciones de base de datos
- ✅ Lógica de negocio compleja
- ✅ Cálculos matemáticos (scores, porcentajes)
- ✅ Validación de datos
- ✅ Transformación de tipos
- ✅ Correcciones de bugs (test de regresión)

## 📊 Estado Actual

### Tests Creados
- ✅ ExamService - Batch submissions
- ✅ ExamService - Complete session
- ✅ ExamService - Score calculation
- ✅ ExamService - Column naming
- ✅ ExamService - Type handling

### Pendientes
- ⏳ AuthService tests
- ⏳ QuestionService tests
- ⏳ UserService tests
- ⏳ Integration tests
- ⏳ E2E tests

## 🔄 CI/CD Integration

Los tests se ejecutarán automáticamente en:
- Pre-commit hooks (opcional)
- Pull requests
- Merges a main/develop
- Deployments

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [TDD Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Nota importante**: Los tests actuales tienen mocks incompletos que necesitan refinarse. Por ahora, sirven como **documentación ejecutable** de los requisitos y casos que el código debe manejar correctamente.

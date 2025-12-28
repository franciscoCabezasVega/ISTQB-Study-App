# 🧪 Testing Guidelines - ISTQB Study App

## 🎯 Filosofía: Test-First Development

**Cada cambio de código DEBE incluir tests**. Sin excepciones.

---

## 📋 Checklist para Nuevas Funcionalidades

Antes de considerar una tarea como "completa", verifica:

- [ ] ✅ Tests escritos que cubren happy path
- [ ] ✅ Tests para edge cases identificados  
- [ ] ✅ Tests para manejo de errores
- [ ] ✅ Tests de regresión si corrige un bug
- [ ] ✅ Todos los tests pasan (`npm test`)
- [ ] ✅ Cobertura >= 70% para el código nuevo
- [ ] ✅ Código revisado para type safety
- [ ] ✅ Documentación actualizada si aplica

---

## 🔴 Errores Históricos que Prevenimos con Tests

### 1. **UUID vs TEXT en selected_answer_id**

**Error**: `invalid input syntax for type uuid: "1"`

```typescript
// ❌ MAL - Columna era UUID, datos eran "1", "2", "3"
selected_answer_id: UUID 

// ✅ BIEN - Columna TEXT acepta strings
selected_answer_id: TEXT

// Test que previene regresión:
it('should accept TEXT IDs (not just UUIDs) for selected answers', () => {
  expect(savedAnswer.selected_answer_id).toBe('1'); // STRING
});
```

### 2. **DECIMAL vs INTEGER en score**

**Error**: `invalid input syntax for type integer: "12.5"`

```typescript
// ❌ MAL - Score decimal en columna INTEGER
const score = (5 / 8) * 100; // 62.5

// ✅ BIEN - Redondear antes de guardar
const score = Math.round((5 / 8) * 100); // 63

// Test que previene regresión:
it('should save score as INTEGER (not decimal)', () => {
  expect(Number.isInteger(result.score)).toBe(true);
});
```

### 3. **Nombres de columna incorrectos**

**Error**: `Could not find the 'time_spent_seconds' column`

```typescript
// ❌ MAL - Columna no existe
time_spent_seconds: timeElapsed

// ✅ BIEN - Usar nombre correcto
total_time_spent: timeElapsed

// Test que previene regresión:
it('should use correct column name: total_time_spent', () => {
  expect(mockUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ total_time_spent: expect.any(Number) })
  );
});
```

### 4. **N+1 queries en batch submissions**

**Problema**: 40 peticiones HTTP (una por respuesta) = ~8 segundos

```typescript
// ❌ MAL - Loop de peticiones
for (const answer of answers) {
  await apiClient.submitExamAnswer(...);
}

// ✅ BIEN - Batch en una petición
await apiClient.submitExamAnswersBatch(sessionId, answers);

// Test que previene regresión:
it('should batch insert all answers in one operation', () => {
  expect(mockInsert).toHaveBeenCalledTimes(1); // Solo UNA llamada
});
```

---

## 🛠️ Template para Nuevos Tests

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    // Setup
    const mockData = { /* ... */ };
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    // Happy path
    it('should successfully perform expected action', async () => {
      // Arrange
      mockFunction.mockResolvedValue({ data: mockData, error: null });
      
      // Act
      const result = await Service.method();
      
      // Assert
      expect(result).toEqual(expectedValue);
      expect(mockFunction).toHaveBeenCalledWith(expectedParams);
    });

    // Edge case
    it('should handle edge case X', async () => {
      // Test edge case
    });

    // Error handling
    it('should throw error when Y fails', async () => {
      mockFunction.mockResolvedValue({ data: null, error: new Error('Test error') });
      
      await expect(Service.method()).rejects.toThrow('Test error');
    });

    // Regression test
    it('should prevent bug #123 from happening again', async () => {
      // Test específico para bug corregido
    });
  });
});
```

---

## 🚀 Workflow Recomendado

### Opción A: Test-First (TDD)

```bash
1. Escribir test que falla
2. Implementar funcionalidad mínima
3. Ejecutar test → pasa ✅
4. Refactorizar
5. Commit
```

### Opción B: Test-After (más pragmático)

```bash
1. Implementar funcionalidad
2. Escribir tests que cubran casos críticos
3. Ejecutar tests → verificar que pasan ✅
4. Refactorizar si es necesario
5. Commit
```

**Ambas son válidas, pero NO omitir los tests.**

---

## 📊 Comandos Útiles

```bash
# Ejecutar todos los tests
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Ver cobertura
npm run test:coverage

# Ejecutar solo un archivo
npm test ExamService.spec.ts

# Ejecutar tests que coincidan con patrón
npm test -- --testNamePattern="batch"
```

---

## ⚡ Tips para Tests Rápidos

1. **Mock Supabase** - No conectar a DB real
2. **Usar datos mínimos** - Solo lo necesario para el test
3. **Tests independientes** - No compartir estado entre tests
4. **Nombres descriptivos** - Que expliquen qué se está probando
5. **Arrange-Act-Assert** - Estructura clara

---

## 🎓 Recursos de Aprendizaje

- [Jest Docs](https://jestjs.io/)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [AAA Pattern](https://medium.com/@pjbgf/title-testing-code-ocd-and-the-aaa-pattern-df453975ab80)

---

## ❗ Regla de Oro

> **Si arreglaste un bug, DEBES agregar un test que hubiera detectado ese bug.**

Esto garantiza que:
- ✅ El bug está realmente arreglado
- ✅ No regresará en el futuro
- ✅ El equipo entiende qué causó el problema

---

**Última actualización**: 18 de diciembre de 2025
**Responsable**: Equipo de QA

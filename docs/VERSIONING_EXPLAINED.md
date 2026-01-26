# 📊 Explicación del Versionamiento Semántico en el Proyecto

**Fecha:** 25 de enero de 2026  
**Tu pregunta:** ¿Por qué las versiones saltan a 1.2.0 y 1.3.0 en lugar de 1.1.1?

---

## ✅ Respuesta: Tu versionamiento está CORRECTO

Las versiones saltan porque estás usando **Semantic Versioning** correctamente y tus commits de tipo `feat:` generan versiones **MINOR**, no **PATCH**.

---

## 🔢 Cómo Funciona Semantic Versioning

### Formato: MAJOR.MINOR.PATCH (ej: 1.2.3)

```
1.2.3
│ │ │
│ │ └─── PATCH: Bugfixes, mejoras sin cambios de funcionalidad (1.2.3 → 1.2.4)
│ └───── MINOR: Nueva funcionalidad compatible (1.2.0 → 1.3.0)
└─────── MAJOR: Cambios incompatibles/breaking changes (1.0.0 → 2.0.0)
```

---

## 📝 Tus Commits y Versiones Generadas

### Análisis de tus últimos releases:

#### v1.0.9 → v1.1.0 (MINOR +1) ✅
**Commit:** `feat: migrate frontend to static site and fix ESLint warnings`
- **Tipo:** `feat` → Genera versión **MINOR**
- **Razón:** Nueva funcionalidad (migración a static site)
- **Correcto:** Sí, es nueva funcionalidad que merece MINOR

#### v1.1.0 → v1.2.0 (MINOR +1) ✅
**Commit:** `feat: migrate frontend to static site, fix tests, and move cron to cron-job.org`
- **Tipo:** `feat` → Genera versión **MINOR**
- **Razón:** Nueva funcionalidad (mover cron a cron-job.org)
- **Correcto:** Sí, cambio arquitectónico importante

#### v1.0.8 → v1.0.9 (PATCH +1) ✅
**Commits:** Varios `fix:` (timezone fixes, imports, etc.)
- **Tipo:** `fix` → Genera versión **PATCH**
- **Razón:** Correcciones de bugs
- **Correcto:** Sí, solo bugfixes

---

## 🎯 Tu Configuración Actual (.releaserc.json)

```json
{
  "releaseRules": [
    { "type": "feat", "release": "minor" },      // 1.X.0
    { "type": "fix", "release": "patch" },       // 1.0.X
    { "type": "perf", "release": "patch" },      // 1.0.X
    { "type": "refactor", "release": "patch" },  // 1.0.X
    { "type": "docs", "release": "patch" },      // 1.0.X
    { "type": "chore", "release": false },       // No release
    { "type": "style", "release": false },       // No release
    { "type": "test", "release": false },        // No release
    { "breaking": true, "release": "major" }     // X.0.0
  ]
}
```

**Esto es 100% correcto** según las mejores prácticas.

---

## 💡 ¿Cuándo se incrementa cada número?

### PATCH (1.0.X) - Cambios pequeños
**Tipos de commit:** `fix:`, `perf:`, `refactor:`, `docs:`

**Ejemplos:**
```bash
git commit -m "fix: corregir error en validación"        # 1.2.0 → 1.2.1
git commit -m "perf: optimizar query de base de datos"   # 1.2.1 → 1.2.2
git commit -m "docs: actualizar README"                  # 1.2.2 → 1.2.3
git commit -m "refactor: simplificar componente Header"  # 1.2.3 → 1.2.4
```

### MINOR (1.X.0) - Nueva funcionalidad
**Tipos de commit:** `feat:`

**Ejemplos:**
```bash
git commit -m "feat: agregar modo de revisión"           # 1.2.0 → 1.3.0
git commit -m "feat: implementar chat en vivo"           # 1.3.0 → 1.4.0
git commit -m "feat(exam): agregar timer visual"         # 1.4.0 → 1.5.0
```

### MAJOR (X.0.0) - Breaking changes
**Tipos de commit:** Cualquier tipo con `BREAKING CHANGE:` en el footer

**Ejemplo:**
```bash
git commit -m "feat!: cambiar estructura de API

BREAKING CHANGE: todos los endpoints ahora requieren API key"
# 1.5.0 → 2.0.0
```

---

## 🤔 ¿Por Qué Saltan las Versiones?

**Tus commits recientes:**
1. `feat: migrate frontend to static site` → **MINOR** (1.X.0)
2. `feat: migrate frontend to static site, fix tests, and move cron` → **MINOR** (1.X.0)

**Por eso:**
- 1.0.9 → 1.1.0 (primer `feat`)
- 1.1.0 → 1.2.0 (segundo `feat`)

**Si hubieras usado `fix:` o `chore:`:**
- 1.0.9 → 1.0.10 (`fix`)
- 1.1.0 → 1.1.1 (`fix`)

---

## 📋 Guía Rápida de Tipos de Commit

| Quiero... | Usar tipo | Incrementa |
|-----------|-----------|------------|
| Agregar nueva funcionalidad | `feat:` | MINOR (1.X.0) |
| Corregir un bug | `fix:` | PATCH (1.0.X) |
| Mejorar performance | `perf:` | PATCH (1.0.X) |
| Refactorizar código | `refactor:` | PATCH (1.0.X) |
| Actualizar docs | `docs:` | PATCH (1.0.X) |
| Actualizar dependencias | `chore:` | Nada |
| Cambiar estilos/formato | `style:` | Nada |
| Agregar tests | `test:` | Nada |
| Cambio incompatible | `feat!:` + `BREAKING CHANGE:` | MAJOR (X.0.0) |

---

## ✅ Recomendaciones para tu Caso

### Si quieres versiones PATCH (1.2.X):
Usa commits más específicos:

```bash
# En lugar de:
git commit -m "feat: mejorar StreakCounter"

# Usa (si es solo un bugfix o mejora):
git commit -m "fix: mejorar visualización de racha perdida"
git commit -m "perf: optimizar cálculo de racha"
```

### Si quieres versiones MINOR (1.X.0):
Sigue usando `feat:` como lo haces:

```bash
git commit -m "feat: agregar detección automática de racha perdida"
git commit -m "feat: implementar modo oscuro automático"
```

---

## 🎯 Mi Recomendación

**Tu versionamiento actual es correcto.** Las migraciones importantes (static site, cron-job.org) merecen versión MINOR porque son cambios arquitectónicos significativos.

**Para el cambio del StreakCounter:**

Opción A (PATCH - recomendado para este caso):
```bash
git add packages/web/components/StreakCounter.tsx
git commit -m "fix: improve streak visual feedback when lost

- Add automatic streak expiration detection
- Display gray fire emoji and counter when >1 day without studying
- Client-side calculation for better UX"
```
→ Generará: 1.2.0 → 1.2.1

Opción B (MINOR - si lo consideras nueva funcionalidad):
```bash
git commit -m "feat: add automatic streak expiration detection"
```
→ Generará: 1.2.0 → 1.3.0

**Mi sugerencia:** Usa `fix:` porque es una mejora de un componente existente, no una funcionalidad completamente nueva.

---

## 📚 Recursos

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [docs/SEMANTIC_RELEASE.md](SEMANTIC_RELEASE.md) - Tu documentación
- [docs/VERSIONING_GUIDE.md](VERSIONING_GUIDE.md) - Guía de versiones

---

## ❓ FAQ

**P: ¿Está mal que salte de 1.1.0 a 1.2.0?**  
R: No, está perfecto. Es el comportamiento esperado cuando haces commits tipo `feat:`.

**P: ¿Cómo puedo generar versión 1.1.1?**  
R: Usa commits tipo `fix:`, `perf:`, `refactor:` o `docs:`.

**P: ¿Cuándo debo usar MAJOR (2.0.0)?**  
R: Solo cuando hagas cambios incompatibles (breaking changes) que requieran que los usuarios modifiquen su código.

**P: ¿Los commits `chore:` generan versión?**  
R: No, según tu configuración no generan ningún release.


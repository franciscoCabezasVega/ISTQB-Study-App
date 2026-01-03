# 🚀 Semantic Release - Release Automático

## 🎯 ¿Qué es esto?

Sistema de **release automático** que se ejecuta cada vez que haces merge a `main`. Analiza tus commits y:

✅ Crea releases automáticamente
✅ Actualiza versión en package.json
✅ Genera CHANGELOG.md
✅ Actualiza badges en README
✅ Crea tags en GitHub
✅ Publica release notes

---

## 🔄 Flujo de Trabajo

### 1. **Desarrollo en rama develop**

```bash
git checkout develop
# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop
```

### 2. **Crear Pull Request a main**

- Ve a GitHub
- Crea PR de `develop` → `main`
- Revisa cambios
- Haz merge cuando esté listo

### 3. **Release Automático** ✨

Cuando haces merge a `main`:

1. ✅ GitHub Actions ejecuta el workflow `release.yml`
2. ✅ Valida tipos, linting y build
3. ✅ **semantic-release** analiza commits desde el último release
4. ✅ Determina la nueva versión según los commits
5. ✅ Actualiza package.json
6. ✅ Genera CHANGELOG.md
7. ✅ Actualiza badges en README
8. ✅ Crea tag y GitHub release
9. ✅ Hace commit con `[skip ci]` para no ejecutar CI de nuevo

---

## 📝 Convención de Commits

**IMPORTANTE**: Usa commits convencionales para que semantic-release funcione correctamente.

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commits

| Tipo | Versión | Descripción | Ejemplo |
|------|---------|-------------|---------|
| `feat` | **MINOR** | Nueva funcionalidad | `feat: añadir simulador de examen` |
| `fix` | **PATCH** | Corrección de bug | `fix: corregir validación de respuestas` |
| `perf` | **PATCH** | Mejora de rendimiento | `perf: optimizar carga de preguntas` |
| `refactor` | **PATCH** | Refactorización | `refactor: simplificar QuestionCard` |
| `docs` | **PATCH** | Documentación | `docs: actualizar README` |
| `chore` | **NO** | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `style` | **NO** | Formato de código | `style: aplicar prettier` |
| `test` | **NO** | Tests | `test: añadir tests de API` |
| `BREAKING CHANGE` | **MAJOR** | Cambio incompatible | Ver ejemplo abajo |

### Ejemplos

#### Minor Release (1.0.0 → 1.1.0)
```bash
git commit -m "feat: añadir sistema de logros"
git commit -m "feat(auth): implementar OAuth con Google"
```

#### Patch Release (1.0.0 → 1.0.1)
```bash
git commit -m "fix: corregir error de autenticación"
git commit -m "perf: mejorar tiempo de carga"
git commit -m "docs: actualizar guía de instalación"
```

#### Major Release (1.0.0 → 2.0.0)
```bash
git commit -m "feat!: cambiar estructura de base de datos

BREAKING CHANGE: la tabla 'questions' ahora se llama 'exam_questions'"
```

#### Sin Release
```bash
git commit -m "chore: actualizar dependencias"
git commit -m "style: aplicar eslint"
git commit -m "test: añadir tests unitarios"
```

---

## ⚙️ Configuración

### Archivo: `.releaserc.json`

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/exec",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```

### Workflow: `.github/workflows/release.yml`

Se ejecuta en:
- ✅ Push a rama `main`
- ❌ NO se ejecuta si el commit contiene `[skip ci]`

---

## 🎨 Actualización de Badges y Versión

### Badges en README

El script `scripts/update-badges.js` actualiza automáticamente:

- ✅ Badge de versión en README.md
- ✅ Badge de versión en README.es.md
- ✅ Badge de tests passing
- ✅ Badge de coverage con colores dinámicos

**Colores según versión**:
- `alpha` → 🟠 orange
- `beta` → 🟡 yellow
- `rc` → 🔵 lightblue
- `stable` → 🟢 brightgreen

### Versión en la Aplicación

La versión se actualiza automáticamente en el **Footer** de la aplicación:

**Cómo funciona**:
1. ✅ semantic-release actualiza `package.json` con la nueva versión
2. ✅ `next.config.js` lee la versión del `package.json` raíz
3. ✅ La inyecta como `NEXT_PUBLIC_APP_VERSION` durante el build
4. ✅ El Footer la muestra con el badge correcto (Alpha/Beta/Stable)

**Ubicación**: `packages/web/next.config.js`
```javascript
env: {
  NEXT_PUBLIC_APP_VERSION: rootPackageJson.version,
  NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split('T')[0],
}
```

**Componente**: `packages/web/components/Footer.tsx`
```tsx
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-alpha';
```

**Resultado visible**: 
- En el footer de la app verás: `v1.0.1-alpha` con badge "Alpha"
- Se actualiza automáticamente en cada deploy después del release

---

## 📊 Versionado Semántico

### Formato: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Cambios incompatibles (breaking changes)
- **MINOR** (1.0.0 → 1.1.0): Nueva funcionalidad compatible
- **PATCH** (1.0.0 → 1.0.1): Correcciones de bugs

### Pre-releases

- `1.0.0-alpha.1` → Versión en desarrollo
- `1.0.0-beta.1` → Versión en testing
- `1.0.0-rc.1` → Release candidate

---

## 🔍 Verificar Release

### Antes de hacer merge a main:

```bash
# Ver commits desde el último tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Simular qué versión se generaría (local)
npx semantic-release --dry-run
```

### Después del release:

1. Ve a: https://github.com/franciscoCabezasVega/ISTQB-Study-App/releases
2. Verifica el nuevo release
3. Revisa CHANGELOG.md
4. Confirma que badges se actualizaron

---

## 🛠️ Comandos Útiles

```bash
# Ver historial de tags
git tag -l

# Ver detalles de un tag
git show v1.0.0

# Ver changelog generado
cat CHANGELOG.md

# Probar script de badges localmente
node scripts/update-badges.js 1.2.3

# Simular release (no hace cambios)
npx semantic-release --dry-run
```

---

## 🚨 Solución de Problemas

### No se crea release automáticamente

**Causa**: Commits no siguen convención conventional commits

**Solución**: Asegúrate de usar `feat:`, `fix:`, etc.

```bash
# ❌ MAL
git commit -m "added new feature"

# ✅ BIEN
git commit -m "feat: add new feature"
```

### Release crea versión incorrecta

**Causa**: Tipo de commit incorrecto

**Solución**: Usa el tipo correcto según la tabla de arriba

### Workflow falla en GitHub Actions

**Causa**: Falta configurar secretos

**Solución**: 
1. Ve a Settings → Secrets → Actions
2. Añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Badge no se actualiza

**Causa**: Script de badges tiene error

**Solución**: Prueba localmente
```bash
node scripts/update-badges.js 1.0.0
git diff README.md
```

---

## 📚 Referencias

- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

## 🎉 Ejemplo Completo

### Scenario: Añadir nueva funcionalidad

```bash
# 1. Trabajar en develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feat/gamification-system

# 3. Hacer cambios
# ... código ...

# 4. Commits convencionales
git add .
git commit -m "feat: add achievement system"
git commit -m "feat: add daily streak counter"
git commit -m "fix: fix badge calculation"

# 5. Push y crear PR
git push origin feat/gamification-system
# Crear PR en GitHub: feat/gamification-system → develop

# 6. Merge a develop
# Una vez aprobado, hacer merge

# 7. Cuando esté listo para release, crear PR a main
# Crear PR en GitHub: develop → main

# 8. Merge a main
# semantic-release se ejecuta automáticamente

# 9. Resultado:
# ✅ Versión: 1.0.0 → 1.1.0 (por los feat:)
# ✅ CHANGELOG actualizado
# ✅ Badge actualizado a 1.1.0
# ✅ Tag v1.1.0 creado
# ✅ GitHub Release publicado
```

---

## ✅ Checklist de Release

Antes de hacer merge a main:

- [ ] Todos los tests pasan
- [ ] Commits siguen convención conventional commits
- [ ] README actualizado si es necesario
- [ ] Documentación actualizada
- [ ] No hay TODOs pendientes críticos
- [ ] Build funciona correctamente
- [ ] Has probado los cambios localmente

---

## 🔮 Próximos Pasos

- [ ] Configurar Dependabot para PRs automáticos de dependencias
- [ ] Añadir validación de commits convencionales en pre-commit hook
- [ ] Configurar deploy automático a Render después del release
- [ ] Añadir notificaciones de Slack/Discord para nuevos releases

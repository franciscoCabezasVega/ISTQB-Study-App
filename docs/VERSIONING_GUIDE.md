# 📋 Guía de Versionado y Releases

Esta guía explica cómo gestionar versiones y crear releases en el proyecto ISTQB Study App.

## 📚 Índice

1. [Convención de Versionado](#convención-de-versionado)
2. [Crear una Nueva Versión](#crear-una-nueva-versión)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [GitHub Releases Automáticos](#github-releases-automáticos)
5. [Actualizar el CHANGELOG](#actualizar-el-changelog)

---

## Convención de Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):

```
MAJOR.MINOR.PATCH[-prerelease]
```

- **MAJOR**: Cambios incompatibles en la API (breaking changes)
- **MINOR**: Nueva funcionalidad compatible hacia atrás
- **PATCH**: Corrección de bugs compatible hacia atrás
- **Prerelease**: alpha, beta, rc (release candidate)

### Ejemplos

- `1.0.0` - Versión estable
- `1.0.0-alpha` - Versión alpha
- `1.0.0-beta` - Versión beta
- `1.1.0-rc.1` - Release candidate 1 para versión 1.1.0
- `1.0.1` - Corrección de bugs

---

## Crear una Nueva Versión

### Método 1: Script Interactivo (Recomendado)

Ejecuta el script de release interactivo:

```bash
npm run release
```

El script te guiará paso a paso:

1. Seleccionar tipo de versión (patch, minor, major, custom)
2. Seleccionar tipo de cambio (added, changed, fixed, etc.)
3. Ingresar notas del release
4. Confirmar y crear commit/tag
5. Opcionalmente hacer push a GitHub

### Método 2: Scripts npm

Para actualizaciones rápidas de versión:

```bash
# Incrementar versión patch (1.0.0 -> 1.0.1)
npm run version:patch

# Incrementar versión minor (1.0.0 -> 1.1.0)
npm run version:minor

# Incrementar versión major (1.0.0 -> 2.0.0)
npm run version:major
```

⚠️ **Nota**: Estos scripts solo actualizan el número de versión. Debes actualizar manualmente el CHANGELOG.md

### Método 3: Manual

1. **Actualizar versión en package.json**

```bash
# En el root y en todos los workspaces
# package.json
# packages/web/package.json
# packages/api/package.json
# packages/shared/package.json
```

2. **Actualizar CHANGELOG.md**

Añade una nueva entrada siguiendo el formato:

```markdown
## [1.1.0] - 2025-01-15

### ✨ Added
- Nueva funcionalidad X
- Nuevo componente Y

### 🐛 Fixed
- Corrección del bug Z
```

3. **Crear commit y tag**

```bash
git add .
git commit -m "chore: release v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push && git push --tags
```

---

## Flujo de Trabajo

### 1. Desarrollo

- Trabaja en una rama feature/bugfix
- Haz commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` para nuevas funcionalidades
  - `fix:` para corrección de bugs
  - `docs:` para cambios en documentación
  - `style:` para cambios de formato
  - `refactor:` para refactorización
  - `test:` para añadir tests
  - `chore:` para tareas de mantenimiento

### 2. Merge a Main

- Haz merge de tu rama a `main`
- Asegúrate de que los tests pasen

### 3. Crear Release

- Ejecuta `npm run release`
- Sigue el proceso interactivo
- El script creará el commit, tag y opcionalmente hará push

### 4. GitHub Release Automático

- Al hacer push del tag, GitHub Actions automáticamente:
  - Ejecuta los tests
  - Construye el proyecto
  - Crea un GitHub Release
  - Extrae notas del CHANGELOG
  - Marca como pre-release si es alpha/beta/rc

---

## GitHub Releases Automáticos

### Configuración

El workflow `.github/workflows/release.yml` se activa automáticamente cuando:

- Se hace push de un tag que coincida con: `v*.*.*`
- Ejemplos: `v1.0.0`, `v1.0.0-alpha`, `v2.1.5-beta`, `v1.0.0-rc.1`

### Proceso Automático

1. **Detección del Tag**: GitHub detecta el push del tag
2. **Checkout**: Descarga el código
3. **Setup**: Instala Node.js y dependencias
4. **Extract Version**: Extrae la versión del tag
5. **Extract Changelog**: Extrae las notas del CHANGELOG.md
6. **Tests**: Ejecuta los tests (continúa si fallan)
7. **Build**: Construye el proyecto (continúa si falla)
8. **Create Release**: Crea el GitHub Release
9. **Summary**: Genera un resumen del release

### Ver Releases

Los releases se crean automáticamente en:
```
https://github.com/tu-usuario/istqb-study-app/releases
```

---

## Actualizar el CHANGELOG

### Formato

El CHANGELOG sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/):

```markdown
## [Unreleased]

### Planeado
- Funcionalidad futura

---

## [1.1.0] - 2025-01-15

### ✨ Added
- Nueva funcionalidad de chat en vivo
- Soporte para más idiomas

### 🔧 Changed
- Mejorada la UI del simulador de examen

### 🐛 Fixed
- Corregido bug en el cálculo de racha
- Solucionado problema de autenticación

### 🔒 Security
- Actualizado paquete vulnerable

### ⚡ Performance
- Optimizado tiempo de carga inicial
```

### Tipos de Cambios

- `✨ Added` - Nuevas funcionalidades
- `🔧 Changed` - Cambios en funcionalidades existentes
- `🗑️ Deprecated` - Funcionalidades que serán removidas
- `🔥 Removed` - Funcionalidades removidas
- `🐛 Fixed` - Corrección de bugs
- `🔒 Security` - Cambios relacionados con seguridad
- `⚡ Performance` - Mejoras de rendimiento
- `📚 Documentation` - Cambios en documentación

---

## Mostrar Versión en la UI

La versión se muestra automáticamente en el footer de la aplicación.

### Variables de Entorno

Configura en `.env.local`:

```env
NEXT_PUBLIC_APP_VERSION=1.0.0-alpha
NEXT_PUBLIC_BUILD_DATE=2025-12-28
```

Estas variables se leen en el componente `Footer.tsx` y se muestran al usuario.

---

## Checklist para Release

Antes de crear un release, verifica:

- [ ] Todos los tests pasan
- [ ] La documentación está actualizada
- [ ] El CHANGELOG está actualizado
- [ ] No hay console.logs o TODOs en el código
- [ ] Las variables de entorno están documentadas
- [ ] Los cambios están merged a main
- [ ] La versión está actualizada en todos los package.json

---

## Troubleshooting

### El tag no activó el workflow

- Verifica que el tag coincida con el patrón `v*.*.*`
- Asegúrate de haber hecho push del tag: `git push --tags`
- Revisa los permisos de GitHub Actions en tu repositorio

### El release no muestra las notas del CHANGELOG

- Verifica que la versión en el CHANGELOG coincida exactamente con el tag
- Asegúrate de seguir el formato exacto: `## [1.0.0]`

### Quiero editar un release ya creado

- Ve a la página de releases en GitHub
- Haz clic en "Edit" en el release que quieres modificar
- Actualiza la descripción y guarda

---

## Ejemplo Completo

```bash
# 1. Terminar desarrollo
git add .
git commit -m "feat: añadir sistema de notificaciones push"

# 2. Merge a main
git checkout main
git merge feature/push-notifications

# 3. Crear release
npm run release
# > Selecciona: 2 (minor)
# > Tipo: 1 (added)
# > Notas: 
# > - Sistema de notificaciones push implementado
# > - Configuración de recordatorios mejorada
# > Confirmar: s
# > Push: s

# 4. Verificar
# El workflow de GitHub creará automáticamente el release
# Ve a: https://github.com/tu-usuario/istqb-study-app/releases
```

---

## Referencias

- [Semantic Versioning](https://semver.org/lang/es/)
- [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## Soporte

Si tienes dudas o problemas con el versionado:

1. Revisa esta guía
2. Consulta el CHANGELOG.md
3. Revisa los releases anteriores en GitHub
4. Abre un issue en el repositorio


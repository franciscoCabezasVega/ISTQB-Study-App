# 🚀 Pasos para Subir tu Primer Release a GitHub

## 📋 Checklist Pre-Release

Antes de crear el release, verifica:

- [x] Sistema de versionado configurado (✅ Verificado con `node scripts/verify-version-system.js`)
- [ ] Todos los cambios están guardados
- [ ] La aplicación funciona correctamente
- [ ] No hay console.logs innecesarios
- [ ] El README está actualizado

---

## 🔧 Comandos a Ejecutar

### 1️⃣ Ver el estado actual de Git

```bash
git status
```

### 2️⃣ Añadir todos los archivos nuevos y modificados

```bash
git add .
```

### 3️⃣ Crear commit con el sistema de versionado

```bash
git commit -m "chore: setup complete versioning and release system

- Add CHANGELOG.md with version 1.0.0-alpha
- Add release script for interactive versioning
- Add GitHub Actions workflow for automatic releases
- Add Footer component with version display
- Add versioning guide and documentation
- Add PR and Issue templates
- Update all package.json to version 1.0.0-alpha
- Add translations for footer (ES/EN)
"
```

### 4️⃣ Push a GitHub (rama main)

```bash
git push origin main
```

Si es la primera vez que haces push a este repositorio:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 5️⃣ Crear el tag de versión 1.0.0-alpha

```bash
git tag -a v1.0.0-alpha -m "Release v1.0.0-alpha

First alpha release of ISTQB Study App with complete feature set:
- Question engine with ISTQB syllabus
- Exam simulator (40 questions, 60 minutes)
- Spaced repetition algorithm
- Progress tracking and statistics
- Gamification system
- Reminders (email + push notifications)
- PWA with offline support
- Multi-language (ES/EN)
"
```

### 6️⃣ Push del tag a GitHub

```bash
git push origin v1.0.0-alpha
```

O push de todos los tags:

```bash
git push --tags
```

---

## 🎯 ¿Qué pasará después del push del tag?

1. **GitHub Actions se activará automáticamente** 🤖
   - Se ejecutarán los tests
   - Se construirá el proyecto
   - Se extraerán las notas del CHANGELOG.md
   - Se creará un GitHub Release

2. **Verás el Release en GitHub** 📦
   - Ve a: `https://github.com/TU-USUARIO/TU-REPO/releases`
   - Deberías ver el release `v1.0.0-alpha`
   - Estará marcado como "Pre-release" (por ser alpha)

3. **El Release incluirá** 📋
   - Todas las notas del CHANGELOG
   - Lista de commits incluidos
   - Assets si están configurados
   - Badge de pre-release

---

## 🔍 Verificar el Release

### En GitHub Actions:

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow **"Create Release"** ejecutándose
4. Click en el workflow para ver los detalles

### En Releases:

1. Ve a tu repositorio en GitHub
2. Click en **"Releases"** (barra lateral derecha)
3. Verás el release **"v1.0.0-alpha"**
4. Verifica que contenga las notas del CHANGELOG

---

## 🐛 Troubleshooting

### ❌ "Permission denied" al hacer push

**Solución**: Configura tu autenticación de GitHub

```bash
# Con HTTPS (recomendado)
git remote set-url origin https://github.com/TU-USUARIO/TU-REPO.git

# Luego usa un Personal Access Token cuando te pida la contraseña
```

O configura SSH:

```bash
git remote set-url origin git@github.com:TU-USUARIO/TU-REPO.git
```

### ❌ El workflow no se ejecuta

**Posibles causas**:

1. **GitHub Actions no está habilitado**
   - Ve a Settings → Actions → General
   - Habilita "Allow all actions and reusable workflows"

2. **El tag no sigue el formato correcto**
   - Debe ser: `vX.X.X` (ej: v1.0.0-alpha)
   - Revisa el nombre del tag: `git tag -l`

3. **No tienes permisos de escritura**
   - Verifica que el repositorio sea tuyo o que tengas permisos

### ❌ El release se crea pero está vacío

**Solución**: Verifica el CHANGELOG.md

- Asegúrate que el formato es exactamente: `## [1.0.0-alpha] - 2025-12-28`
- El número de versión en el CHANGELOG debe coincidir con el tag (sin la 'v')

---

## 📝 Comandos Rápidos (Copy-Paste)

Si ya verificaste todo y solo quieres ejecutar:

```bash
# 1. Status
git status

# 2. Add
git add .

# 3. Commit
git commit -m "chore: setup versioning and release system"

# 4. Push
git push origin main

# 5. Tag
git tag -a v1.0.0-alpha -m "Release v1.0.0-alpha"

# 6. Push tag
git push origin v1.0.0-alpha

# 7. Verificar
echo "✅ Done! Check: https://github.com/TU-USUARIO/TU-REPO/releases"
```

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

✅ Tu código estará en GitHub
✅ El tag v1.0.0-alpha estará creado
✅ GitHub Actions habrá creado el release automáticamente
✅ Podrás ver el release en la página de Releases

---

## 🔄 Próximos Releases

Para futuras versiones, simplemente usa:

```bash
npm run release
```

Y sigue el proceso interactivo. ¡Es así de fácil! 🚀

---

## 📚 Referencias

- [CHANGELOG.md](../CHANGELOG.md) - Ver historial completo
- [VERSIONING_GUIDE.md](VERSIONING_GUIDE.md) - Guía detallada de versionado
- [VERSION_SYSTEM_SETUP.md](VERSION_SYSTEM_SETUP.md) - Resumen de implementación
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github) - Documentación oficial

---

**Fecha**: 28 de diciembre de 2025
**Versión**: 1.0.0-alpha
**Estado**: ✅ Listo para release

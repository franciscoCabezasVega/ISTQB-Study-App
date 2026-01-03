# CI/CD Setup - Prevención de Errores en Deploy

## 🎯 Objetivo

Este sistema de CI/CD está diseñado para **prevenir errores en el deploy de Render** validando el código antes de que llegue a producción.

## 🛡️ Capas de Protección

### 1. **Pre-Commit Hook** (Local)
Se ejecuta **antes de cada commit** para detectar errores rápidamente:

✅ Type checking (TypeScript)
✅ Linting (ESLint)

**Ubicación**: `.husky/pre-commit`

**Beneficio**: Detecta errores inmediatamente mientras desarrollas.

### 2. **Pre-Push Hook** (Local)
Se ejecuta **antes de hacer push** al repositorio:

✅ Type checking completo
✅ Linting completo
✅ Build validation (compila todo el proyecto)

**Ubicación**: `.husky/pre-push`

**Beneficio**: Asegura que todo compila correctamente antes de subir a GitHub.

### 3. **GitHub Actions** (Remoto)
Se ejecuta **automáticamente en cada push y pull request**:

- ✅ Type checking
- ✅ Linting
- ✅ Build backend
- ✅ Build frontend
- ✅ Tests (opcional)

**Ubicación**: `.github/workflows/ci.yml`

**Beneficio**: Última línea de defensa antes de que Render intente hacer deploy.

---

## 📝 Scripts Disponibles

### Validación Local

```bash
# Validar todo el proyecto (type-check + lint + build)
npm run validate

# Validar solo el backend
npm run validate:api

# Validar solo el frontend
npm run validate:web

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### Comandos Útiles

```bash
# Ejecutar validación antes de deploy
npm run pre-deploy

# Si necesitas saltarte los hooks (NO RECOMENDADO)
git commit --no-verify -m "mensaje"
git push --no-verify
```

---

## ⚙️ Configuración de Husky

Husky está configurado para ejecutar validaciones automáticamente en:

1. **Pre-commit**: Valida tipos y linting
2. **Pre-push**: Valida tipos, linting y build completo

### Personalizar Hooks

Edita los archivos en `.husky/`:

- `.husky/pre-commit` - Se ejecuta antes de cada commit
- `.husky/pre-push` - Se ejecuta antes de cada push

---

## 🚀 GitHub Actions CI/CD

### Workflow Actual

**Archivo**: `.github/workflows/ci.yml`

**Triggers**:
- Push a ramas `main` y `develop`
- Pull requests a `main` y `develop`

**Jobs**:

1. **lint-and-typecheck**
   - Verifica tipos en todos los workspaces
   - Ejecuta ESLint

2. **build-backend**
   - Compila el backend (packages/api)
   - Verifica que no hay errores de compilación

3. **build-frontend**
   - Compila el frontend (packages/web)
   - Verifica configuración de Next.js

4. **test** (opcional)
   - Ejecuta tests unitarios e integración
   - Se puede desactivar si los tests no están listos

### Variables de Entorno en GitHub

Para que el CI funcione correctamente, necesitas configurar estos secretos en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Añade estos secrets:

```
NEXT_PUBLIC_SUPABASE_URL=https://pygermjcpomedeyujiut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-key-aqui>
```

---

## 🔧 Solución de Problemas

### Error: "husky: command not found"

```bash
npm install
npx husky install
```

### Los hooks no se ejecutan

```bash
# Reinstalar husky
rm -rf .husky
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### GitHub Actions falla pero local funciona

- Verifica que todas las variables de entorno estén configuradas en GitHub Secrets
- Revisa los logs en GitHub Actions para ver el error específico
- Asegúrate de que `npm run build` funciona localmente

### Pre-push tarda mucho tiempo

Si `npm run validate` tarda demasiado, puedes:

1. Desactivar el build en pre-push (solo dejar type-check y lint)
2. Editar `.husky/pre-push` y comentar la línea del validate

---

## 📊 Flujo de Trabajo Recomendado

### Desarrollo Normal

```bash
# 1. Hacer cambios en el código
# 2. Commit (automáticamente valida tipos y linting)
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push (automáticamente valida build completo)
git push origin develop

# 4. GitHub Actions valida todo
# 5. Si pasa, puedes hacer merge a main
# 6. Render automáticamente hace deploy desde main
```

### Si Necesitas Hacer Deploy Urgente

```bash
# 1. Validar manualmente antes de hacer commit
npm run validate

# 2. Si pasa, hacer commit y push
git add .
git commit -m "fix: corrección urgente"
git push

# 3. Verificar que GitHub Actions pase
# 4. Hacer merge a main
# 5. Render hará deploy automáticamente
```

---

## ✅ Checklist Antes de Deploy

- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` compila correctamente
- [ ] GitHub Actions está en verde ✅
- [ ] Has probado los cambios localmente
- [ ] Has actualizado la documentación si es necesario

---

## 🎉 Beneficios de Este Setup

1. **Detecta errores temprano**: Antes de hacer commit, no en Render
2. **Ahorra tiempo**: No necesitas esperar 5-10 minutos del deploy para ver errores
3. **Ahorra dinero**: No gastas minutos de build en Render con errores obvios
4. **Mejor código**: Fuerza buenas prácticas (tipos, linting)
5. **Confianza**: Sabes que si pasa el CI, el deploy funcionará
6. **Documentación automática**: GitHub muestra el estado de los checks

---

## 🔮 Próximos Pasos

1. **Configurar Tests**: Añadir tests automatizados al CI
2. **Deploy Preview**: Configurar preview environments en Render para PRs
3. **Semantic Release**: Automatizar versionado basado en commits convencionales
4. **Code Coverage**: Añadir reportes de cobertura de tests
5. **Dependency Updates**: Configurar Dependabot para actualizar dependencias

---

## 📚 Referencias

- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

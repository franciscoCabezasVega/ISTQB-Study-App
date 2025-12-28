# Test Manual para Validar Correcciones

## Problemas Identificados y Soluciones

### 1. **Problema: Logros no se muestran después de cerrar e iniciar sesión**

**Causa raíz:**
- El store de autenticación no tenía un estado de `isLoading`
- La página de achievements intentaba cargar datos antes de que el usuario estuviera completamente cargado del localStorage

**Solución implementada:**
- ✅ Agregado estado `isLoading` al authStore
- ✅ La página de achievements espera a que `authLoading` sea `false` antes de intentar cargar
- ✅ Agregado manejo de errores con opción de retry

**Cómo probar:**
1. Iniciar sesión en la aplicación
2. Navegar a /achievements - debe mostrar los logros
3. Cerrar sesión
4. Iniciar sesión nuevamente
5. Navegar a /achievements - debe mostrar los logros inmediatamente

**Resultado esperado:**
- Los logros se muestran correctamente después de iniciar sesión
- No hay errores 401 en la consola
- El skeleton loader aparece brevemente mientras carga

---

### 2. **Problema: Redirección al cerrar sesión no funciona**

**Causa raíz:**
- `router.push()` puede fallar si el componente se desmonta durante la navegación
- El localStorage no se limpiaba explícitamente

**Solución implementada:**
- ✅ Usar `window.location.href` en lugar de `router.push()`
- ✅ Limpiar localStorage explícitamente en la función `logout()`
- ✅ Logout limpia todos los estados antes de redirigir

**Cómo probar:**
1. Iniciar sesión
2. Click en botón "Cerrar sesión" / "Logout"
3. Observar la redirección

**Resultado esperado:**
- La página redirige inmediatamente a /auth/signin
- No queda ningún dato en localStorage (verificar en DevTools → Application → Local Storage)
- La sesión está completamente cerrada

---

## Tests Automatizados Creados

### Archivo: `__tests__/auth.test.ts`

**Casos de prueba incluidos:**

1. ✅ **Logout Flow**
   - Limpia datos de autenticación del localStorage
   - Redirige a la página de signin

2. ✅ **Achievements Load Flow**
   - No carga achievements si user es null
   - Carga achievements cuando el usuario existe
   - Espera a que el usuario se cargue del localStorage

3. ✅ **Token Persistence**
   - Persiste el token en localStorage
   - Recupera el token para llamadas a la API

4. ✅ **Session Expiry**
   - Maneja respuesta 401 limpiando auth y redirigiendo

### Cómo ejecutar los tests

```bash
# Navegar al directorio web
cd packages/web

# Instalar dependencias de testing (si no están)
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom

# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test

# Ejecutar tests una vez
npm run test:run
```

---

## Cambios Realizados - Resumen

### 1. **authStore.ts**
```typescript
// Agregado:
- isLoading: boolean
- initialize(): void
- Limpieza explícita de localStorage en logout()
```

### 2. **Header.tsx**
```typescript
// Cambiado:
- router.push() → window.location.href
- Logout usa window.location.href para asegurar redirección
```

### 3. **achievements/page.tsx**
```typescript
// Agregado:
- const { user, isLoading: authLoading } = useAuthStore()
- Manejo de estado authLoading
- Manejo de errores con retry
- Loading state mejorado
```

### 4. **Tests Creados**
```
__tests__/auth.test.ts - Tests unitarios del flujo de autenticación
vitest.config.ts - Configuración de Vitest
vitest.setup.ts - Setup global para tests
```

---

## Checklist de Validación

### Pre-logout
- [ ] Usuario está autenticado y ve su nombre en el header
- [ ] Token está presente en localStorage (DevTools)
- [ ] Logros se muestran correctamente en /achievements

### Durante Logout
- [ ] Click en botón "Logout"
- [ ] Redirección inmediata a /auth/signin
- [ ] No hay errores en consola

### Post-logout
- [ ] LocalStorage está limpio (no hay 'auth-storage')
- [ ] Header muestra botón "Sign in"
- [ ] No se pueden acceder a rutas protegidas

### Nuevo Login
- [ ] Iniciar sesión exitosamente
- [ ] Token se guarda en localStorage
- [ ] Navegar a /achievements
- [ ] Logros se cargan correctamente
- [ ] No hay errores 401

---

## Logs de Debug Útiles

Para debug, puedes agregar estos logs temporales:

```typescript
// En achievements/page.tsx
useEffect(() => {
  console.log('🔍 Auth state:', { user, authLoading });
  if (!authLoading) {
    if (user) {
      console.log('✅ User loaded, fetching achievements...');
      loadAchievements();
    } else {
      console.log('❌ No user, showing sign in prompt');
      setLoading(false);
    }
  }
}, [user, authLoading]);
```

---

## Problemas Conocidos Resueltos

1. ✅ **Hydration mismatch** - Agregado `suppressHydrationWarning`
2. ✅ **Estadísticas error 500** - Funciones RPC actualizadas
3. ✅ **Logros no cargan** - Espera correcta del estado de auth
4. ✅ **Logout no redirige** - Usa window.location.href
5. ✅ **Token no se limpia** - Limpieza explícita en logout

---

## Próximos Pasos (Opcional)

Si los problemas persisten después de estas correcciones:

1. Verificar que el backend esté corriendo
2. Verificar que el token no esté expirado
3. Limpiar cache del navegador completamente
4. Verificar la consola del navegador para errores específicos
5. Verificar Network tab en DevTools para ver llamadas fallidas

---

**Última actualización:** 18 de diciembre de 2025

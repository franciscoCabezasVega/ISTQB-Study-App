# 🔐 Token Expiration Handling

## Problema Resuelto

**Error:** `{"statusCode":401,"message":"Invalid or expired token"}`

Este error ocurre cuando:
- El token JWT ha expirado
- El token es inválido o fue revocado
- El usuario cerró sesión en otro dispositivo

## ✅ Solución Implementada

### 1. **Interceptor de Respuesta en Axios**

Detecta automáticamente errores 401 y toma acción:

```typescript
// packages/web/lib/api.ts
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar estado de autenticación
      localStorage.removeItem('auth-storage');
      
      // Redirigir al login con query param
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/signin?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. **Mensaje Visual de Sesión Expirada**

En la página de login, se muestra un banner informativo:

- ⏱️ **Tu sesión ha expirado**
- Por favor, inicia sesión nuevamente para continuar

### 3. **Flujo Completo**

```
1. Usuario hace petición al API
   ↓
2. Token ha expirado → Backend responde 401
   ↓
3. Interceptor detecta 401
   ↓
4. Limpia localStorage (auth-storage)
   ↓
5. Redirige a /auth/signin?expired=true
   ↓
6. Muestra mensaje de sesión expirada
   ↓
7. Usuario inicia sesión nuevamente
   ↓
8. Obtiene nuevo token válido
```

## 🎯 Ventajas

1. **Automático** - No requiere código adicional en cada componente
2. **Consistente** - Mismo comportamiento en toda la app
3. **User-friendly** - Mensaje claro en lugar de error confuso
4. **Seguro** - Limpia credenciales expiradas inmediatamente
5. **No interrumpe auth pages** - No redirige si ya estás en /auth/*

## 📝 Mejoras Futuras (Opcionales)

### Opción A: Refresh Token

Para evitar que el usuario tenga que hacer login cada vez:

```typescript
// Guardar refresh token
localStorage.setItem('refresh-token', refreshToken);

// En el interceptor
if (error.response?.status === 401) {
  const refreshToken = localStorage.getItem('refresh-token');
  if (refreshToken) {
    // Intentar renovar el token
    const newToken = await refreshAccessToken(refreshToken);
    // Reintentar la petición original
    return retryRequest(error.config, newToken);
  }
}
```

### Opción B: Warning Antes de Expirar

Mostrar un modal 5 minutos antes de que expire:

```typescript
// Decodificar JWT y verificar exp
const tokenExpiry = decodeJWT(token).exp;
const timeUntilExpiry = tokenExpiry - Date.now();

if (timeUntilExpiry < 5 * 60 * 1000) {
  showWarning('Tu sesión expirará pronto. ¿Deseas extenderla?');
}
```

### Opción C: Remember Me

Token de larga duración si el usuario marca "Recordarme":

```typescript
const expiresIn = rememberMe ? '30d' : '1d';
```

## 🧪 Tests Implementados

- ✅ Limpieza de storage en 401
- ✅ Redirección con query param
- ✅ No redirigir si ya en /auth/*
- ✅ Parsing de auth-storage
- ✅ Manejo de storage corrupto
- ✅ Header de Authorization correcto

## 🚀 Uso

No requiere cambios en el código existente. El interceptor funciona automáticamente en todas las peticiones HTTP.

**Antes:**
```typescript
// Cada componente manejaba errores 401 individualmente
try {
  const data = await apiClient.getStreak();
} catch (error) {
  if (error.response?.status === 401) {
    // Logout manual
    router.push('/auth/signin');
  }
}
```

**Ahora:**
```typescript
// El interceptor maneja todo automáticamente
const data = await apiClient.getStreak();
// Si hay 401, redirige automáticamente
```

## 🔍 Debugging

Para verificar el comportamiento:

1. Abrir DevTools → Application → Local Storage
2. Buscar `auth-storage`
3. Ver el `accessToken`
4. Esperar a que expire (o modificarlo manualmente a uno inválido)
5. Hacer cualquier petición al API
6. Verificar que:
   - Se limpia el storage
   - Redirige a /auth/signin?expired=true
   - Muestra el banner amarillo

## 📚 Referencias

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Token Refresh Strategies](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)

---

**Última actualización:** 18 de diciembre de 2025  
**Responsable:** Equipo de QA  
**Estado:** ✅ Implementado y probado

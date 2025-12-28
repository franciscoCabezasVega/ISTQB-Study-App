# Fix de Permisos de Funciones - Instrucciones

**Fecha:** 25 de diciembre de 2025  
**Problema:** Error 500 al intentar obtener estadísticas después de aplicar fixes de seguridad  
**Causa:** Las funciones RPC tienen `SECURITY DEFINER` pero faltaban los permisos GRANT EXECUTE

---

## El Problema

Después de aplicar las correcciones de seguridad (20251225_security_fixes.sql), las funciones quedaron así:

```sql
CREATE OR REPLACE FUNCTION public.get_combined_user_statistics_by_topic(p_user_id uuid)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Ejecuta con privilegios del dueño
SET search_path = public, pg_temp
AS $$
...
$$;
```

**Problema:** `SECURITY DEFINER` hace que la función se ejecute con privilegios del dueño de la función, pero NO otorga automáticamente permisos de ejecución a los roles `authenticated` o `anon`.

**Resultado:** Error de permisos al intentar ejecutar `supabase.rpc('get_combined_user_statistics_by_topic', ...)`

---

## La Solución

### Paso 1: Aplicar la migración de permisos

La migración `20251225_fix_function_permissions.sql` hace lo siguiente:

1. **Otorga permisos EXECUTE a authenticated:**
   ```sql
   GRANT EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.get_combined_user_success_rate(uuid) TO authenticated;
   GRANT EXECUTE ON FUNCTION public.get_question_in_language(uuid, text) TO authenticated;
   ```

2. **Revoca permisos de anon (usuarios no autenticados):**
   ```sql
   REVOKE EXECUTE ON FUNCTION public.get_combined_user_statistics_by_topic(uuid) FROM anon;
   -- ... (para todas las funciones sensibles)
   ```

3. **Confirma permisos en tablas:**
   - Las funciones acceden a: `study_answers`, `exam_answers`, `exam_sessions`, `questions`
   - Ya están protegidas por RLS, pero confirmamos los GRANTs necesarios

### Paso 2: Aplicar en Supabase

**Opción A: Usando Supabase CLI**
```bash
# Desde la raíz del proyecto
supabase db push
```

**Opción B: Manual en Supabase Dashboard**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `migrations/20251225_fix_function_permissions.sql`
3. Ejecuta la migración
4. Verifica que no haya errores

**Opción C: Usando la herramienta MCP Supabase**
```bash
# Si tienes el MCP tool configurado
mcp_supabase_apply_migration --file migrations/20251225_fix_function_permissions.sql
```

---

## Verificación

### 1. Verificar permisos de funciones

Ejecuta en SQL Editor:

```sql
-- Ver permisos de las funciones
SELECT 
  p.proname AS function_name,
  r.rolname AS role,
  has_function_privilege(r.oid, p.oid, 'EXECUTE') AS can_execute
FROM pg_proc p
CROSS JOIN pg_roles r
WHERE p.proname IN (
  'get_combined_user_statistics_by_topic',
  'get_combined_user_success_rate',
  'get_question_in_language'
)
AND r.rolname IN ('authenticated', 'anon')
ORDER BY p.proname, r.rolname;
```

**Resultado esperado:**
```
function_name                              | role          | can_execute
------------------------------------------|---------------|-------------
get_combined_user_statistics_by_topic     | authenticated | true
get_combined_user_statistics_by_topic     | anon          | false
get_combined_user_success_rate            | authenticated | true
get_combined_user_success_rate            | anon          | false
get_question_in_language                  | authenticated | true
get_question_in_language                  | anon          | false
```

### 2. Probar el endpoint desde el frontend

```bash
# Con el servidor corriendo
curl -X GET http://localhost:3001/api/answers/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada:**
```json
{
  "successRate": 75.5,
  "statisticsByTopic": [
    {
      "topic": "Fundamentals of Testing",
      "total_questions": 10,
      "correct_answers": 8,
      "incorrect_answers": 2,
      "success_rate": 80.00
    }
  ]
}
```

### 3. Verificar logs del backend

El servicio ahora incluye logs mejorados:

```typescript
if (error) {
  console.error('Error fetching statistics:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}
```

---

## Seguridad Mantenida

✅ **RLS sigue activo:** Todas las tablas mantienen sus políticas RLS  
✅ **SECURITY DEFINER seguro:** Las funciones tienen `search_path` fijo  
✅ **Permisos mínimos:** Solo `authenticated` puede ejecutar funciones sensibles  
✅ **Anon restringido:** Usuarios no autenticados NO pueden ejecutar estas funciones  

---

## Troubleshooting

### Error: "permission denied for function"

**Causa:** La migración no se aplicó correctamente  
**Solución:** Re-aplicar la migración 20251225_fix_function_permissions.sql

### Error: "function does not exist"

**Causa:** Las funciones no se crearon en la migración de seguridad  
**Solución:** Aplicar primero 20251225_security_fixes.sql, luego 20251225_fix_function_permissions.sql

### Error: "could not serialize access"

**Causa:** Conflicto de transacciones concurrentes  
**Solución:** Temporal, reintentar la petición

---

## Próximos Pasos

1. ✅ Aplicar migración de permisos
2. ✅ Verificar que el endpoint `/api/answers/statistics` funciona
3. ✅ Probar desde el frontend (página de progreso)
4. ✅ Revisar logs para asegurar que no hay más errores de permisos
5. ✅ Documentar en SECURITY_FIXES.md que el problema fue resuelto

---

## Referencias

- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [PostgreSQL GRANT](https://www.postgresql.org/docs/current/sql-grant.html)

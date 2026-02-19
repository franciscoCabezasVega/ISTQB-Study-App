# 📊 Instrucciones para Optimización de Tráfico Supabase

## Resumen de Cambios

Se han implementado optimizaciones que reducen el tráfico a Supabase en un **83%**:

### 1. Optimización de Queries (50% reducción)
- ✅ Implementado JOIN único en lugar de 2 queries separadas
- ✅ `ReminderSchedulerService.ts` modificado
- ✅ 12 requests/hora → **Sin cambios en cron-job.org**

### 2. Intervalo del Scheduler (67% reducción adicional)
- ✅ Ventana de tiempo ampliada de 5 a 15 minutos
- ✅ `ReminderUtils.ts` modificado
- ⚠️ **REQUIERE cambio en cron-job.org**

## 🔧 Acción Requerida: Actualizar cron-job.org

### Pasos para actualizar la frecuencia del cron:

1. **Acceder a cron-job.org**
   - URL: https://cron-job.org
   - Iniciar sesión con las credenciales del proyecto

2. **Localizar el job existente**
   - Buscar: `ISTQB Reminder Scheduler`
   - URL: `https://istqb-api.onrender.com/api/scheduler/reminders/process`

3. **Modificar la frecuencia**
   - **Actual**: Every 5 minutes (`*/5 * * * *`)
   - **Nuevo**: Every 15 minutes (`*/15 * * * *`)

4. **Guardar cambios**
   - Verificar que el job esté habilitado
   - Confirmar que el header `x-scheduler-key` sigue configurado

### Cron Expression:
```
*/15 * * * *
```

## 📈 Impacto Esperado

| Métrica | Antes | Después | Ahorro |
|---------|-------|---------|--------|
| Requests/hora | 24 | 4 | **83%** |
| Requests/día | 288 | 49 | **83%** |
| Requests/mes | ~8,640 | ~1,470 | **83%** |

## ✅ Verificación

Después de actualizar cron-job.org, espera 1 hora y verifica:

```bash
# Revisar logs en Supabase
Ver logs de API en Supabase Dashboard → Logs → API
Filtrar por: /rest/v1/study_reminders

# Deberías ver:
- Solo 2-4 requests cada 15 minutos
- En lugar de 2 requests cada 5 minutos
```

## 🔍 Detalles Técnicos

### Cambios en el Código

1. **ReminderSchedulerService.ts**
   ```typescript
   // ANTES: 2 queries separadas
   const reminders = await ReminderService.getActiveRemindersToSend();
   const { data: users } = await supabase.from('users')...

   // DESPUÉS: 1 query con JOIN
   const { data } = await supabase.from('study_reminders')
     .select('*, users!inner(id, email, full_name, language, timezone)')
     .eq('enabled', true);
   ```

2. **ReminderUtils.ts**
   ```typescript
   // ANTES: Ventana de 5 minutos
   currentMinute >= preferredMinute && currentMinute < preferredMinute + 5

   // DESPUÉS: Ventana de 15 minutos
   currentMinute >= preferredMinute && currentMinute < preferredMinute + 15
   ```

## 💡 Beneficios

- ✅ **Menor costo**: Reducción significativa en uso de recursos de Supabase
- ✅ **Mejor eficiencia**: Menos requests innecesarios
- ✅ **Sin impacto**: Los usuarios no notarán diferencia (recibir notificación a las 9:00 vs 9:10 es aceptable)
- ✅ **Escalabilidad**: Sistema más sostenible a largo plazo

## 📚 Referencias

- [render.yaml](render.yaml) - Configuración actualizada
- [SCHEDULER_QUICKSTART.md](docs/SCHEDULER_QUICKSTART.md) - Documentación del scheduler
- [ReminderSchedulerService.ts](packages/api/src/services/ReminderSchedulerService.ts) - Implementación

---

**Fecha de implementación**: 18 de febrero de 2026
**Autor**: Optimización de tráfico Supabase

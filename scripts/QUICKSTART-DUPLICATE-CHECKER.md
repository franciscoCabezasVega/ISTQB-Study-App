# 🚀 Guía Rápida - Detector de Preguntas Duplicadas

## ⚡ Inicio Rápido

### 1️⃣ Configurar variables de entorno

Asegúrate de tener un archivo `.env` en la raíz del proyecto con:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 2️⃣ Instalar dependencias (si es necesario)

```bash
npm install
```

### 3️⃣ Ejecutar el script

```bash
npm run check-duplicates
```

## 📸 Ejemplo de salida

```
🔍 Iniciando análisis de preguntas duplicadas...

📥 Obteniendo preguntas de la base de datos...
✅ Se obtuvieron 150 preguntas

🔎 Buscando preguntas con respuestas idénticas...

================================================================================
📊 REPORTE DE PREGUNTAS DUPLICADAS
================================================================================

📝 Total de preguntas analizadas: 150

⚠️  Tópicos con preguntas duplicadas: 2

────────────────────────────────────────────────────────────────────────────────
📚 TÓPICO: Fundamentos del Testing
────────────────────────────────────────────────────────────────────────────────

  🔍 Grupo de duplicados #1:
     3 preguntas con respuestas idénticas

     1. ID: abc-123-def-456
        Título (ES): ¿Qué es el testing de software?

     2. ID: ghi-789-jkl-012
        Título (ES): Definición de testing de software

     3. ID: mno-345-pqr-678
        Título (ES): Concepto de testing

     Opciones compartidas:
        1. Es el proceso de verificar que el software funcione correctamente
        2. Es solo escribir código
        3. Es documentar requisitos
        4. Es diseñar interfaces

================================================================================
📊 RESUMEN:
   • Total de preguntas duplicadas: 6
   • Tópicos afectados: 2
   • Grupos de duplicados: 2
================================================================================

💾 Reporte exportado a: C:\...\scripts\duplicate-questions-report.json

✅ Análisis completado exitosamente
```

## 📊 Interpretar los resultados

### ✅ Sin duplicados
```
📝 Total de preguntas analizadas: 150

✅ ¡Excelente! No se encontraron preguntas con respuestas idénticas.
```

### ⚠️ Con duplicados
El reporte mostrará:
- **Grupos de duplicados**: Preguntas con las mismas opciones
- **Tópico**: En qué categoría están las preguntas
- **IDs**: Para identificar y eliminar duplicados
- **Títulos**: Para comparar visualmente

## 🔧 Acciones recomendadas

### Si encuentras duplicados:

1. **Revisar el archivo JSON generado**
   ```bash
   # Ubicación: scripts/duplicate-questions-report.json
   cat scripts/duplicate-questions-report.json
   ```

2. **Verificar en Supabase**
   - Ir al Dashboard de Supabase
   - Navegar a la tabla `questions`
   - Buscar por los IDs reportados

3. **Decidir qué hacer**
   - ✅ **Mantener una y eliminar las demás**: Si son realmente duplicadas
   - ✅ **Modificar las opciones**: Si las preguntas son diferentes pero tienen respuestas iguales
   - ✅ **Dejar como están**: Si las duplicadas son intencionales

4. **Eliminar duplicados (SQL)**
   ```sql
   -- Eliminar pregunta específica
   DELETE FROM questions WHERE id = 'id-de-la-pregunta-duplicada';
   
   -- Verificar que se eliminó
   SELECT COUNT(*) FROM questions;
   ```

## 🎯 Casos de uso comunes

### Antes de importar nuevas preguntas
```bash
npm run check-duplicates
# Revisar si hay duplicados existentes
# Luego importar nuevas preguntas
# Volver a ejecutar para verificar
```

### Auditoría mensual
```bash
# Crear un cron job o recordatorio mensual
npm run check-duplicates
# Revisar el reporte
# Limpiar duplicados si es necesario
```

### Después de modificaciones masivas
```bash
# Después de actualizar preguntas en bulk
npm run check-duplicates
# Verificar que no se crearon duplicados accidentalmente
```

## 🆘 Solución de problemas

### ❌ Error: "Faltan variables de entorno"
**Solución:**
```bash
# Verificar que existe el archivo .env
ls -la .env

# Ver el contenido (sin mostrar las keys)
cat .env | grep SUPABASE_URL
```

### ❌ Error: "ts-node: command not found"
**Solución:**
```bash
# Instalar dependencias
npm install

# Si persiste, instalar ts-node globalmente
npm install -g ts-node
```

### ❌ Error: "Failed to fetch questions"
**Posibles causas:**
1. ✅ Verificar conexión a internet
2. ✅ Verificar que las credenciales sean correctas
3. ✅ Verificar que la tabla `questions` exista en Supabase

**Solución:**
```bash
# Probar la conexión a Supabase manualmente
curl https://tu-proyecto.supabase.co/rest/v1/questions \
  -H "apikey: tu_anon_key"
```

### ⚠️ El script muestra duplicados pero no lo son
**Posible causa:** Las opciones son similares pero no idénticas

**Solución:** Revisar manualmente en el archivo JSON las opciones exactas:
```bash
# Ver el reporte detallado
cat scripts/duplicate-questions-report.json | grep -A 10 "questions"
```

## 📚 Referencias

- [README completo](./README-DUPLICATE-CHECKER.md)
- [Código del script](./check-duplicate-questions.ts)
- [Tipos compartidos](../packages/shared/src/types.ts)

## 💡 Tips

1. **Ejecuta el script regularmente**: Previene acumulación de duplicados
2. **Guarda los reportes JSON**: Útil para auditoría histórica
3. **Compara con versiones anteriores**: Identifica tendencias
4. **Documenta las eliminaciones**: Mantén registro de qué preguntas eliminaste y por qué

---

¿Necesitas ayuda? Revisa el [README completo](./README-DUPLICATE-CHECKER.md) o abre un issue en GitHub.

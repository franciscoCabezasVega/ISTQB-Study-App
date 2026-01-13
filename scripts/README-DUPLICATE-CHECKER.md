# 🔍 Detector de Preguntas Duplicadas

Script para identificar preguntas duplicadas en la base de datos basándose en respuestas idénticas.

## 📋 Descripción

Este script analiza todas las preguntas en la base de datos de Supabase y detecta si existen preguntas que tengan exactamente las mismas opciones de respuesta. El análisis se realiza agrupando por tópico para facilitar la identificación.

## 🎯 ¿Qué detecta?

El script identifica preguntas que tienen:
- Opciones de respuesta idénticas (sin importar mayúsculas/minúsculas o espacios extra)
- Mismas respuestas en el mismo tópico
- Posibles duplicados que necesitan revisión manual

## 🚀 Uso

### Requisitos previos

1. Asegúrate de tener las variables de entorno configuradas en el archivo `.env`:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   # o
   SUPABASE_ANON_KEY=tu_anon_key
   ```

2. Tener ts-node instalado (ya viene con las dependencias del proyecto)

### Ejecución

Ejecuta el script desde la raíz del proyecto:

```bash
npm run check-duplicates
```

## 📊 Salida

El script genera dos tipos de salida:

### 1. Salida en consola

Muestra un reporte detallado con:
- Total de preguntas analizadas
- Número de tópicos con duplicados
- Grupos de preguntas duplicadas organizados por tópico
- Detalles de cada pregunta duplicada (ID, título, opciones)

Ejemplo:
```
================================================================================
📊 REPORTE DE PREGUNTAS DUPLICADAS
================================================================================

📝 Total de preguntas analizadas: 150

⚠️  Tópicos con preguntas duplicadas: 2

────────────────────────────────────────────────────────────────────────────────
📚 TÓPICO: Fundamentos del Testing

  🔍 Grupo de duplicados #1:
     3 preguntas con respuestas idénticas

     1. ID: abc-123-def
        Título (ES): ¿Qué es el testing de software?
        Título (EN): What is software testing?

     2. ID: ghi-456-jkl
        Título (ES): Definición de testing
        
     3. ID: mno-789-pqr
        Título (ES): Concepto de testing
```

### 2. Archivo JSON

Genera un archivo `duplicate-questions-report.json` en la carpeta `scripts/` con:
- Timestamp del análisis
- Total de preguntas y duplicados
- Detalles completos de cada grupo de duplicados
- Opciones completas de cada pregunta

Estructura del JSON:
```json
{
  "timestamp": "2026-01-12T10:30:00.000Z",
  "totalQuestions": 150,
  "totalDuplicates": 6,
  "topicsWithDuplicates": 2,
  "duplicates": [
    {
      "topic": "Fundamentos del Testing",
      "questionCount": 3,
      "questions": [
        {
          "id": "abc-123-def",
          "title_es": "¿Qué es el testing de software?",
          "title_en": "What is software testing?",
          "options_es": [...],
          "correct_answer_ids": [...]
        }
      ]
    }
  ]
}
```

## 🔧 Cómo funciona

1. **Conexión a Supabase**: Se conecta a la base de datos usando las credenciales del archivo `.env`

2. **Obtención de datos**: Recupera todas las preguntas con sus opciones de respuesta

3. **Agrupación por tópico**: Organiza las preguntas por tópico para facilitar el análisis

4. **Normalización**: 
   - Convierte las opciones a minúsculas
   - Elimina espacios extra
   - Ordena alfabéticamente
   
5. **Comparación**: Compara las opciones normalizadas de cada par de preguntas dentro del mismo tópico

6. **Reporte**: Genera un reporte detallado de los duplicados encontrados

## 🎨 Características

- ✅ Análisis por tópico
- ✅ Normalización inteligente de opciones
- ✅ Reporte en consola con formato legible
- ✅ Exportación a JSON para análisis posterior
- ✅ Manejo de errores robusto
- ✅ Soporte para preguntas en español e inglés

## 📝 Casos de uso

### Detectar preguntas duplicadas antes de insertar nuevas
```bash
npm run check-duplicates
```

### Limpiar base de datos
1. Ejecuta el script
2. Revisa el reporte JSON generado
3. Identifica las preguntas a eliminar
4. Elimínalas manualmente desde Supabase o con SQL

### Auditoría periódica
Ejecuta el script regularmente para mantener la calidad de las preguntas

## ⚠️ Notas importantes

- El script compara **opciones de respuesta**, no títulos ni descripciones
- Preguntas con diferentes títulos pero mismas opciones serán marcadas como duplicadas
- Es una herramienta de detección, no elimina automáticamente preguntas
- La revisión manual es recomendada antes de eliminar preguntas

## 🐛 Solución de problemas

### Error: "Faltan variables de entorno"
- Verifica que el archivo `.env` exista en la raíz del proyecto
- Asegúrate de que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas

### Error: "Failed to fetch questions"
- Verifica la conexión a internet
- Confirma que las credenciales de Supabase sean válidas
- Verifica que la tabla `questions` exista en Supabase

### No se encuentra ts-node
```bash
npm install
```

## 📚 Archivos relacionados

- Script principal: [`scripts/check-duplicate-questions.ts`](./check-duplicate-questions.ts)
- Tipos compartidos: [`packages/shared/src/types.ts`](../packages/shared/src/types.ts)
- Configuración de Supabase: [`.env`](../.env) (no versionado)

## 🤝 Contribuir

Si encuentras un bug o tienes una sugerencia de mejora:
1. Reporta el issue en GitHub
2. Propón mejoras al algoritmo de detección
3. Añade nuevas funcionalidades (ej: comparación de títulos similares)

# Integración del MCP de Render

## Descripción

Render proporciona un servidor MCP (Model Context Protocol) que permite gestionar la infraestructura de Render directamente desde herramientas de IA como GitHub Copilot, Cursor y Claude Code.

## Capacidades del MCP de Render

Con el MCP de Render puedes usar lenguaje natural para:

### 🚀 Gestión de Servicios
- Crear nuevos servicios web y sitios estáticos
- Listar todos los servicios en tu workspace
- Obtener detalles de servicios específicos
- Actualizar variables de entorno de servicios

### 📊 Base de Datos (Render Postgres)
- Crear nuevas bases de datos
- Listar todas las bases de datos
- Ejecutar consultas SQL de solo lectura
- Obtener detalles de bases de datos específicas

### 📈 Métricas y Monitoreo
- Obtener métricas de rendimiento (CPU/memoria)
- Analizar conteo de instancias
- Ver conexiones a datastores
- Analizar respuestas de servicios web por código de estado
- Medir tiempos de respuesta
- Revisar uso de ancho de banda

### 📝 Logs y Deploys
- Listar logs con filtros
- Ver historial de deploys
- Obtener detalles de deploys específicos

### 🔑 Render Key Value (Redis/Valkey)
- Crear instancias Key Value
- Listar instancias
- Obtener detalles de instancias

## Configuración

### Paso 1: Crear API Key de Render

1. Ve a tu [Dashboard de Render](https://dashboard.render.com/settings#api-keys)
2. Dirígete a **Account Settings** → **API Keys**
3. Crea una nueva API Key
4. **Guarda la API Key de forma segura** (no la compartas)

⚠️ **Importante**: Las API Keys de Render tienen acceso completo a todos tus workspaces y servicios.

### Paso 2: Configurar GitHub Copilot

Para GitHub Copilot en VS Code, necesitas configurar el MCP en el archivo de configuración correspondiente.

#### Opción A: Usar el servidor MCP hosteado de Render (Recomendado)

Agrega la siguiente configuración a tu archivo de configuración de MCP:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <TU_API_KEY_DE_RENDER>"
      }
    }
  }
}
```

#### Opción B: Ejecutar localmente con Docker

Si prefieres ejecutar el MCP de Render localmente:

```json
{
  "mcpServers": {
    "render": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "RENDER_API_KEY",
        "-v",
        "render-mcp-server-config:/config",
        "ghcr.io/render-oss/render-mcp-server"
      ],
      "env": {
        "RENDER_API_KEY": "<TU_API_KEY_DE_RENDER>"
      }
    }
  }
}
```

### Paso 3: Configurar el Workspace de Render

Una vez configurado, necesitas indicar qué workspace de Render quieres usar:

```
Set my Render workspace to [NOMBRE_DEL_WORKSPACE]
```

O el asistente te pedirá que selecciones un workspace cuando hagas una consulta que requiera MCP.

## Ejemplos de Uso

### Crear un Servicio Web

```
Deploy an example Flask web service on Render using 
https://github.com/render-examples/flask-hello-world
```

### Crear una Base de Datos

```
Create a new database named istqb-app-db with 10 GB storage
```

### Consultar Métricas

```
What was the busiest traffic day for my service this month?
```

### Analizar Logs

```
Pull the most recent error-level logs for my API service
```

### Ejecutar Query SQL

```
Query my database for the count of users registered in the last 7 days
```

### Listar Servicios

```
List all my Render services
```

## Casos de Uso para la App ISTQB

### 1. Deploy Automatizado

```
Deploy the ISTQB study app to Render using the web package
```

### 2. Configurar Base de Datos

```
Create a Postgres database for the ISTQB app with 5GB storage 
and connect it to the web service
```

### 3. Monitoreo de Rendimiento

```
Show me the CPU and memory usage for my ISTQB app service 
over the last 24 hours
```

### 4. Análisis de Logs

```
Get all error logs from my ISTQB API service in the last hour
```

### 5. Gestión de Variables de Entorno

```
Update the environment variables for my ISTQB service:
- NODE_ENV=production
- SUPABASE_URL=<url>
- SUPABASE_ANON_KEY=<key>
```

### 6. Verificar Estado de Deploys

```
List the last 5 deploys for my ISTQB web service 
and show their status
```

## Limitaciones

⚠️ Ten en cuenta estas limitaciones del MCP de Render:

1. **Creación de recursos**: Solo soporta:
   - Web services
   - Static sites
   - Render Postgres
   - Render Key Value
   
   No soporta: Private services, Background workers, Cron jobs

2. **Instancias gratuitas**: No soporta crear instancias gratuitas

3. **Modificaciones**: Solo puede modificar variables de entorno de servicios existentes. Para otras modificaciones usa el Dashboard o la API REST.

4. **Operaciones destructivas**: No soporta eliminar recursos (usa el Dashboard)

5. **Información sensible**: El MCP intenta minimizar la exposición de información sensible, pero no se garantiza al 100%. Ten cuidado con secrets.

## Seguridad

- Las API Keys de Render tienen permisos amplios
- El MCP puede modificar variables de entorno de servicios
- Mantén tu API Key segura y no la compartas
- Revisa los prompts antes de ejecutar cambios críticos

## Recursos Adicionales

- [Documentación oficial del MCP de Render](https://render.com/docs/mcp-server)
- [Repositorio GitHub del MCP](https://github.com/render-oss/render-mcp-server)
- [API de Render](https://render.com/docs/api)
- [Dashboard de Render](https://dashboard.render.com/)

## Próximos Pasos

1. ✅ Crear cuenta en Render (si no tienes)
2. ✅ Generar API Key
3. ✅ Configurar MCP en GitHub Copilot
4. ✅ Configurar workspace de Render
5. 🚀 Empezar a deployar la app ISTQB

---

**Nota**: Este documento proporciona la configuración necesaria para usar el MCP de Render. No es necesario crear un servidor MCP personalizado ya que Render proporciona uno completamente funcional y mantenido.

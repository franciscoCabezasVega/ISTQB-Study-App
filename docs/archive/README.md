# 📦 Documentos Archivados

Esta carpeta contiene documentación histórica que registra decisiones, procesos y configuraciones completadas en el pasado.

---

## 📂 Contenido

### FIRST_RELEASE_STEPS.md
**Fecha:** Diciembre 2025  
**Estado:** ✅ Completado

Guía paso a paso para crear el primer release en GitHub. Ya se han realizado múltiples releases (v1.0.0 - v1.2.0), por lo que este documento es principalmente referencia histórica.

---

### VERSION_SYSTEM_SETUP.md
**Fecha:** Diciembre 2025  
**Estado:** ✅ Completado

Instrucciones de configuración inicial del sistema de versionado semántico con semantic-release. El sistema ya está configurado y funcionando, ver [VERSIONING_GUIDE.md](../VERSIONING_GUIDE.md) para el uso actual.

---

### RENDER_STATIC_MIGRATION.md
**Fecha:** Enero 2026  
**Estado:** ✅ Completado

Guía de migración del frontend de Web Service a Static Site en Render para reducir costos. La migración se completó exitosamente en la versión 1.2.0.

**Resultado:** Ahorro de $7/mes (frontend ahora es gratis como Static Site)

---

### REMINDERS_WITHOUT_CRONJOB.md
**Fecha:** Diciembre 2025  
**Estado:** ⚠️ Implementación alternativa no usada

Documentación de un sistema de recordatorios que no requiere cronjob externo, enviando emails directamente desde el frontend cuando se disparan las notificaciones web.

**Razón de archivo:** Se optó por usar cron-job.org para mayor confiabilidad y separación de responsabilidades. Ver [SCHEDULER_QUICKSTART.md](../SCHEDULER_QUICKSTART.md) para la implementación actual.

---

### REMINDER_SCHEDULER.md
**Fecha:** Diciembre 2025  
**Estado:** ⚠️ Superpuesto por documentación más concisa

Documentación extensa (505 líneas) del sistema de scheduler de recordatorios. Contenía toda la información técnica detallada pero era muy extenso.

**Razón de archivo:** Reemplazado por [SCHEDULER_QUICKSTART.md](../SCHEDULER_QUICKSTART.md) que es más conciso (283 líneas) y cubre los mismos conceptos de forma más accesible. Para detalles técnicos específicos, este documento sigue siendo válido como referencia.

---

## 🔗 Documentos Actuales Relacionados

Para información actualizada sobre estos temas, consulta:

- **Releases y versiones**: [VERSIONING_GUIDE.md](../VERSIONING_GUIDE.md)
- **Despliegue actual**: [RENDER_DEPLOY_GUIDE.md](../RENDER_DEPLOY_GUIDE.md)
- **Sistema de recordatorios actual**: [SCHEDULER_QUICKSTART.md](../SCHEDULER_QUICKSTART.md)
- **Estado del proyecto**: [PROGRESS.md](../PROGRESS.md)

---

**Nota:** Estos documentos se mantienen por razones históricas y de trazabilidad, pero no representan la configuración o procesos actuales del proyecto.

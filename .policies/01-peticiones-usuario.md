# Política de peticiones de usuario (familiares)

## Objetivo

Definir cómo un familiar crea, consulta y recibe actualizaciones de una solicitud sin necesidad de cuenta.

## Actores

- **Familiar / solicitante**: persona que envía la petición (web pública).
- **Sistema**: genera código de seguimiento, envía notificaciones y expone el estado.
- **Operador**: gestiona la petición en el backoffice (ver política 03).

## Ciclo de vida de una solicitud

```
[Borrador local] → Enviada → Pendiente → (En revisión | En proceso) → Resuelta | Rechazada | Descartada
```

| Estado | Visible al familiar | Descripción |
|--------|---------------------|-------------|
| `pendiente` | Sí | Recibida, aún no revisada por un operador |
| `en_revision` | Sí | Un operador la está evaluando |
| `en_proceso` | Sí | Aceptada y en gestión activa |
| `resuelta` | Sí | Cerrada con resultado positivo o informativo |
| `rechazada` | Sí | No procede; se informa el motivo genérico |
| `descartada` | No (o mensaje neutro) | Eliminada por spam, duplicado o solicitud del titular |

## Creación (web pública)

1. El familiar completa el formulario (nombre, email, teléfono opcional, datos del fallecido, relación, descripción).
2. El sistema valida campos obligatorios y formato de email.
3. Se genera un **código de seguimiento** único e irrepetible (formato sugerido: `HUE-YYYY-XXXXXX`).
4. Se persiste la solicitud en estado `pendiente`.
5. Se envía correo de confirmación con:
   - Código de seguimiento
   - Enlace directo de consulta (token firmado, caducidad configurable)
   - Resumen de lo enviado
6. Se muestra en pantalla el código y un mensaje de éxito.

**No se exige login ni KYC en este paso.**

## Consulta / tracking (sin login)

- Entrada: código de seguimiento **o** enlace con token.
- El sistema muestra solo:
  - Estado actual
  - Fecha de creación y última actualización
  - Mensajes públicos que el operador haya marcado como visibles
- No se exponen notas internas del backoffice ni datos de otros casos.
- Límite de intentos fallidos de código (rate limit) para evitar enumeración.

## Actualizaciones al familiar

- Cada cambio de estado relevante dispara un correo (y opcionalmente SMS).
- El correo incluye el nuevo estado y el enlace de seguimiento.
- El familiar no puede editar la solicitud una vez enviada; solo puede añadir información si el operador lo habilita o abriendo un nuevo caso vinculado.

## Datos mínimos obligatorios

- Nombre completo del familiar
- Email válido
- Nombre del ser querido fallecido
- Relación
- Descripción / relato

Opcional: teléfono, documentos adjuntos (fase posterior), preferencia de contacto.

## Retención y borrado

- El titular puede solicitar el borrado de sus datos (derecho de supresión).
- Las solicitudes `descartadas` o `rechazadas` antiguas pueden anonimizarse según política de retención (definir plazo, ej. 24 meses).

# Política de verificación KYC (Didit)

## Proveedor

**Didit** (https://didit.me) — API v3 de verificación de identidad.

- Autenticación: header `x-api-key`
- Flujo principal: crear sesión (`POST /v3/session/`) con `workflow_id`
- Resultados: webhook + consulta de sesión
- La API key y el webhook secret **nunca** salen del backend / functions serverless

> Nota: el usuario ya dispone de clave de API. Se configurará como variable de entorno `DIDIT_API_KEY` (y `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`).

## Cuándo se exige KYC

KYC **no** es obligatorio para enviar la solicitud inicial.

Se solicita cuando:

1. El operador, al revisar el caso, lo marca como necesario (riesgo, repatriación, trámites formales, etc.).
2. Reglas automáticas futuras (monto, tipo de gestión, país de documentos) lo disparen.

Estados posibles del bloque KYC dentro de una solicitud:

| Estado KYC | Significado |
|------------|-------------|
| `no_requerido` | Por defecto al crear la solicitud |
| `solicitado` | Se generó sesión Didit y se envió enlace al familiar |
| `en_progreso` | El familiar abrió el flujo |
| `aprobado` | Didit devolvió Approved |
| `rechazado` | Didit devolvió Declined / Failed |
| `expirado` | Sesión caducó sin completar |

## Flujo técnico (resumen)

1. Operador (o regla) solicita KYC → function `kyc/create-session`.
2. Function crea sesión en Didit con `vendor_data` = `solicitud_id` (o código de seguimiento).
3. Se guarda `session_id` Didit en la solicitud y se pasa KYC a `solicitado`.
4. Se envía al familiar el enlace de verificación (hosted flow de Didit) por correo.
5. Didit notifica por **webhook** → function `kyc/webhook`.
6. Webhook verifica firma, actualiza estado KYC de la solicitud y notifica al operador (y opcionalmente al familiar con mensaje genérico “verificación completada”).

## Datos que se conservan

- `session_id` Didit
- Estado final (`aprobado` / `rechazado` / …)
- Timestamp
- Referencia mínima necesaria para auditoría

**No** se deben almacenar en Huella imágenes de documentos ni selfies si Didit ya las custodia; solo el veredicto y metadatos acordados con la política de privacidad.

## Seguridad

- Todas las llamadas a Didit se hacen desde **functions serverless**, nunca desde el navegador.
- El webhook debe validar la firma con `DIDIT_WEBHOOK_SECRET`.
- Rate limit y auth en los endpoints que el backoffice use para disparar KYC.

## Relación con otras políticas

- La solicitud puede seguir en `en_proceso` mientras el KYC está `solicitado` o `en_progreso`.
- Un KYC `rechazado` no implica automáticamente el rechazo de la solicitud: el operador decide (política 03).

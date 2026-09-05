# Function: `kyc/webhook`

## Propósito

Recibir notificaciones de Didit cuando una sesión de verificación cambia de estado y actualizar la solicitud correspondiente.

## Trigger

- HTTP `POST` público (pero **firmado**)
- URL configurada en Didit / en el `callback` de create-session

## Flujo

1. Leer body raw y headers de firma.
2. Validar firma con `DIDIT_WEBHOOK_SECRET` (rechazar 401 si no coincide).
3. Extraer `session_id`, `status`, `vendor_data`.
4. Localizar solicitud por `diditSessionId` o por `vendor_data`.
5. Mapear status Didit → `EstadoKyc`:
   - Approved → `aprobado`
   - Declined / Failed → `rechazado`
   - In Progress / etc. → `en_progreso`
   - Expired → `expirado`
6. Actualizar solicitud + auditoría.
7. (Opcional) notificar al operador y/o mensaje genérico al familiar.
8. Responder `200 OK` rápido (Didit reintenta si no).

## Seguridad

- Nunca confiar en el body sin validar la firma.
- No devolver datos sensibles en la respuesta del webhook.
- Idempotencia: procesar dos veces el mismo evento no debe corromper el estado.

## Políticas relacionadas

- `.policies/04-kyc-didit.md`

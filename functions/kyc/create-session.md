# Function: `kyc/create-session`

## Propósito

Crear sesión Didit al ejecutar el caso de uso **MarcarSinVerificar** (`pendiente` → `sin_verificar`).

## Trigger

- Interno: invocada desde `solicitudes/admin-update` / caso de uso de aplicación, no desde el navegador con la API key.

## Flujo

1. Validar que la solicitud está en `pendiente` (o reintento controlado desde `sin_verificar`).
2. `POST https://verification.didit.me/v3/session/` con `workflow_id`, `vendor_data`, `callback`.
3. Guardar `diditSessionId`.
4. Disparar `email/send-kyc-link`.
5. Dejar la solicitud en `sin_verificar`.

## Políticas

- `.policies/03-administracion-peticiones.md`
- `.policies/04-kyc-didit.md`

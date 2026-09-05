# Function: `kyc/webhook`

## Propósito

Recibir resultado Didit y ejecutar **MarcarVerificado** si el status es Approved.

## Flujo

1. Validar firma (`DIDIT_WEBHOOK_SECRET`).
2. Resolver solicitud por `diditSessionId` / `vendor_data`.
3. Si Approved y estado `sin_verificar` → `verificado`.
4. Si Declined/Expired/Failed → registrar resultado; estado sigue `sin_verificar`.
5. Responder 200.

## Políticas

- `.policies/04-kyc-didit.md`

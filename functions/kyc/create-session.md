# Function: `kyc/create-session`

## Propósito

Crear una sesión de verificación de identidad en **Didit** y asociarla a una solicitud existente. Disparada desde el backoffice (operador autenticado) o por una regla automática.

## Trigger

- HTTP `POST` (protegido: solo operadores autenticados)
- Body: `{ solicitudId: string }` o `{ codigoSeguimiento: string }`

## Flujo

1. Validar sesión del operador.
2. Cargar solicitud; abortar si no existe o si ya tiene KYC `aprobado`.
3. Llamar a Didit:

```http
POST https://verification.didit.me/v3/session/
Headers:
  x-api-key: $DIDIT_API_KEY
  Content-Type: application/json
Body:
  {
    "workflow_id": "$DIDIT_WORKFLOW_ID",
    "vendor_data": "<solicitud.id o codigoSeguimiento>",
    "callback": "$PUBLIC_APP_URL/api/kyc/webhook"  // o URL de esta function
  }
```

4. Persistir `diditSessionId` y poner `estadoKyc = 'solicitado'`.
5. Invocar (async) `email/send-kyc-link` con el `url` de la sesión que devuelve Didit.
6. Responder al backoffice: `{ sessionId, verificationUrl, estadoKyc }`.

## Errores

| code | cuándo |
|------|--------|
| `UNAUTHORIZED` | sin sesión de operador |
| `NOT_FOUND` | solicitud inexistente |
| `KYC_ALREADY_APPROVED` | ya verificado |
| `DIDIT_ERROR` | fallo en API Didit |

## Políticas relacionadas

- `.policies/04-kyc-didit.md`
- `.policies/03-administracion-peticiones.md`

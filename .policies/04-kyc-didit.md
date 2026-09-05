# Política de verificación KYC (Didit)

## Cuándo se dispara

**Únicamente** al transicionar la solicitud de `pendiente` a `sin_verificar`
(confirmación de hallazgo/contacto e inicio de negociaciones).

No se pide KYC al crear la solicitud ni para consultar el tracking.

## Flujo

1. Operador confirma contacto/hallazgo → caso de uso `MarcarSinVerificar`.
2. Function `kyc/create-session` crea sesión Didit (`vendor_data` = id o código de la solicitud).
3. Function `email/send-kyc-link` envía el enlace hosted al email del familiar.
4. Familiar completa el flujo Didit.
5. Webhook → caso de uso `MarcarVerificado` (si Approved) o registro de rechazo/expiración.
6. Estado de la solicitud pasa a `verificado` cuando la identidad queda aprobada.

## Estados de la solicitud vs resultado Didit

| Resultado Didit | Efecto en solicitud |
|-----------------|---------------------|
| Approved | `sin_verificar` → `verificado` |
| Declined / Failed | Se mantiene `sin_verificar`; se registra fallo; operador decide (reintento o cierre) |
| Expired | Se mantiene `sin_verificar`; se puede reenviar enlace |

## Datos retenidos en Huella

- `diditSessionId`, resultado, timestamps.
- No almacenar imágenes de documentos/selfies si Didit las custodia.

## Seguridad

- Llamadas a Didit solo desde functions/backend.
- Webhook con validación de firma (`DIDIT_WEBHOOK_SECRET`).

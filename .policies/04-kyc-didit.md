# Política de verificación (Didit KYC y manual)

## Objetivo

Confirmar la identidad del **familiar solicitante** cuando el expediente ya está en atención (`sin_verificar`), con mínima fricción y alternativa ante baja conectividad.

## Cuándo aplica

- **No** al crear la solicitud (`pendiente`).
- **No** obligatorio solo por atender: el operador puede pasar a `sin_verificar` sin abrir Didit.
- **Sí** cuando se inicia KYC Didit (al atender con KYC o con *Iniciar KYC* posterior).
- **Sí** verificación manual cuando Didit no es viable.

## Vía A — Didit (preferente si hay conectividad)

### Disparo

1. Operador ejecuta `solicitudes.marcarSinVerificar` / atender con KYC, o `solicitudes.iniciarKyc`.
2. Function `huella-api` crea sesión Didit (`vendor_data` = id de solicitud).
3. Se persiste `diditSessionId` y, si el schema lo permite, `diditVerificationUrl`.
4. Registro en `kyc_verifications`.
5. Email HTML al familiar (plantilla KYC) + disponibilidad del enlace en tracking y plantilla copiable en backoffice.

### Compleción

| Resultado Didit | Efecto |
|-----------------|--------|
| Approved | `sin_verificar` → `verificado` (vía `huella-webhooks`) |
| Declined / Failed | Se mantiene `sin_verificar`; se registra; operador decide reintento, manual o cierre |
| Expired | Se mantiene `sin_verificar`; se puede regenerar sesión / reenviar email |

### Seguridad Didit

- API key y workflow solo en function env.
- Webhook firmado (`DIDIT_WEBHOOK_SECRET`) en `huella-webhooks`.
- Frontend nunca llama a Didit directamente.

### Datos retenidos

- `diditSessionId`, URL de verificación (si se guarda), resultado, timestamps.
- No almacenar imágenes de documentos/selfies si Didit las custodia.

## Vía B — Verificación manual (extraoficial / baja conectividad)

1. Solo desde `sin_verificar`.
2. Acción `solicitudes.marcarVerificado` con **motivo obligatorio** (texto libre auditado en notas internas).
3. `kycResultado = manual`.
4. Estado → `verificado`.
5. Mensaje público por defecto informando que la identidad fue confirmada.

Uso legítimo: cuando el familiar no puede completar Didit y el equipo valida identidad por canales alternativos documentados.

## Verificación asistida (contacto, sin cambiar estado)

Independiente de A/B: en tracking y en emails se muestra contacto de operador/equipo (`OPERATOR_CONTACT_*`) para que el familiar pida ayuda. Eso **no** cambia el estado por sí solo; el cambio lo hace el operador (Didit o manual).

## Resumen de acciones API

| Action | Auth | Efecto |
|--------|------|--------|
| `solicitudes.marcarAtendido` | operador | → `sin_verificar` (sin Didit si `iniciarKyc=false`) |
| `solicitudes.marcarSinVerificar` / iniciar con KYC | operador | → `sin_verificar` + sesión Didit + email |
| `solicitudes.iniciarKyc` | operador | Sesión Didit desde `sin_verificar` (o pendiente con transición) |
| `solicitudes.reenviarKycEmail` | operador | Reenvía email con URL existente |
| `solicitudes.getKycEmailTemplate` | operador | HTML + asunto para copiar/pegar |
| `solicitudes.marcarVerificado` | operador | Manual → `verificado` |
| Webhook Didit Approved | interno | → `verificado` |

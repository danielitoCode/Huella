# Política de administración de peticiones

## Objetivo

Reglas para que operador/admin mueva una solicitud entre estados canónicos, con verificación Didit o manual y cancelación auditada por PIN personal.

## Estados canónicos

| Estado | Significado |
|--------|-------------|
| `pendiente` | Recién creada; no atendida. |
| `sin_verificar` | **Atendida · sin verificar.** Operador ya gestiona el caso; identidad del solicitante pendiente. |
| `verificado` | Identidad confirmada (Didit **o** manual con motivo). |
| `cerrado` | Proceso terminado. |
| `cancelada` | Descartada; no es borrado físico. |

## Transiciones permitidas

```text
pendiente     ──► sin_verificar     (marcar atendido; KYC Didit opcional en el mismo acto)
sin_verificar ──► verificado        (webhook Didit Approved O marcar verificado manual)
sin_verificar ──► cerrado
verificado    ──► cerrado
pendiente | sin_verificar | verificado ──► cancelada   (PIN personal + motivo)
```

No se reabre `cerrado` ni `cancelada` sin proceso de excepción futuro.

## `pendiente` → `sin_verificar` (atender)

1. Estado → `sin_verificar`.
2. Notas internas opcionales; mensaje público actualizable.
3. **Didit no es obligatorio** en este paso (conectividad, vías asistidas).
4. Opciones de UI:
   - *Marcar atendido* (sin Didit).
   - *Atender + iniciar KYC Didit* (crea sesión, guarda URL, envía email).
5. Desde `sin_verificar` se puede *Iniciar / regenerar KYC* más tarde.

## `sin_verificar` → `verificado`

Ver [04-kyc-didit.md](./04-kyc-didit.md).

## → `cerrado`

- Desde `sin_verificar` o `verificado`.
- **Motivo interno obligatorio.**
- Mensaje público opcional.

## → `cancelada`

- Desde `pendiente`, `sin_verificar` o `verificado`.
- **Motivo interno obligatorio.**
- **PIN de cancelación personal** del operador que ejecuta la acción (4 dígitos).
  - Si el PIN del operador está en estado reseteado (`0000`), la API responde `PIN_RESET_REQUIRED` y debe establecer un PIN propio antes de cancelar.
  - No existe respaldo de PIN global en entorno.
- El documento permanece; auditoría anota motivo + userId (sin guardar el PIN en claro).

## Canales de verificación hacia el familiar (estado `sin_verificar`)

1. **Tracking público**: botón Didit + contacto de verificación asistida.
2. **Email automático** (plantilla HTML memorial) al iniciar/reenviar KYC.
3. **Plantilla HTML copiable** en detalle de backoffice (pegar en cliente de correo del operador).

## Visibilidad

| Dato | Familiar | Operador |
|------|----------|----------|
| Estado / mensaje público | Sí | Sí |
| Notas / motivos internos | No | Sí |
| URL Didit (si aplica) | Sí (tracking) | Sí |
| Contacto operador asistido | Sí (tracking) | Sí |
| PIN / passwords | No | Solo propio / admin según [07](./07-usuarios-operadores.md) |

## Auditoría recomendada

Todo cambio de estado: actor, timestamp, estado anterior/nuevo, motivo cuando aplique.

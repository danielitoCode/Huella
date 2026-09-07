# Política de administración de peticiones

## Objetivo

Reglas para que el operador mueva una solicitud entre los estados canónicos, con soporte a verificación manual (baja conectividad) y cancelación auditada.

## Estados canónicos

| Estado | Significado |
|--------|-------------|
| `pendiente` | Solicitud recién creada; aún no atendida por un operador. |
| `sin_verificar` | **Atendida y sin verificar.** El operador recogió/atendió el caso. La identidad del solicitante aún no está confirmada (Didit o vía extraoficial). |
| `verificado` | Identidad del solicitante confirmada (Didit **o** verificación manual documentada). |
| `cerrado` | Proceso negociado / investigación llevada a término (con o sin resultado). |
| `cancelada` | Caso descartado; requiere confirmación fuerte (PIN o contraseña) + motivo. |

## Transiciones permitidas

```text
pendiente ──► sin_verificar   (marcar atendido; KYC opcional después)
sin_verificar ──► verificado  (Didit webhook O marcar verificado manual)
sin_verificar ──► cerrado
verificado ──► cerrado
*
  └──► cancelada              (PIN/contraseña + motivo; no es borrado)
```

No se permite reabrir `cerrado` ni `cancelada` sin proceso de excepción futura.

## `pendiente` → `sin_verificar` (atender)

Cuando el operador **atiende** el caso (recoge datos, contacta, inicia gestión):

1. Estado → `sin_verificar`.
2. Mensaje público actualizable.
3. Auditoría: quién, cuándo, nota.
4. **Didit KYC no es obligatorio** en este paso (conectividad en Cuba, vías extraoficiales).

Opcionalmente, desde `sin_verificar`, el operador puede **iniciar sesión Didit** (email al familiar).

## `sin_verificar` → `verificado`

Dos vías válidas:

1. **Didit** (webhook Approved) — preferente cuando sea viable.
2. **Manual** — el operador marca verificado con **motivo obligatorio** (p. ej. verificación por vía alternativa documentada). Uso legítimo en baja conectividad.

## → `cerrado`

- Desde `sin_verificar` o `verificado`.
- **Motivo interno obligatorio.**
- Mensaje público opcional para tracking.

## → `cancelada`

- Desde cualquier estado no terminal (`pendiente`, `sin_verificar`, `verificado`).
- **Motivo interno obligatorio.**
- **Confirmación fuerte obligatoria:** PIN de cancelación del backoffice (4 dígitos) o, si se configura, revalidación de contraseña de la cuenta.
- No elimina el documento; queda auditado.
- El PIN de operadores/equipos lo define el **rol administrador** (env `BACKOFFICE_CANCEL_PIN` o gestión futura en colección `operadores`).

## Visibilidad

| Dato | Familiar | Operador |
|------|----------|----------|
| Estado | Sí (etiquetas humanas) | Sí |
| Mensaje público | Sí | Sí |
| Notas / motivos internos | No | Sí |
| Detalle KYC / PIN | No | Sí |

## Auditoría

Todo cambio de estado: `actor`, `timestamp`, `estadoAnterior`, `estadoNuevo`, `motivo` cuando aplique. Cancelaciones siempre con motivo + evidencia de confirmación (PIN verificado, sin almacenar el PIN en claro en auditoría).

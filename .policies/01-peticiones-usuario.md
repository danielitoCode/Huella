# Política de peticiones de usuario (familiares)

## Objetivo

Definir el ciclo de vida de una solicitud y qué ve el familiar en cada estado.

## Estados

| Estado | Quién lo provoca | Qué significa | Visible al familiar |
|--------|------------------|---------------|---------------------|
| `pendiente` | Sistema al crear | Solicitud recibida; cola de revisión | Sí — “Recibida, en espera de revisión” |
| `sin_verificar` | Operador al confirmar hallazgo/contacto e iniciar negociaciones | Se envió enlace de verificación KYC | Sí — “Te enviamos un enlace para verificar tu identidad” |
| `verificado` | Sistema (webhook Didit) o operador si aplica | Identidad confirmada; negociaciones pueden avanzar con certeza | Sí — “Identidad verificada” |
| `cerrado` | Operador | Caso finalizado | Sí — “Proceso cerrado” + mensaje público opcional |

## Transiciones permitidas

```
pendiente ──► sin_verificar ──► verificado ──► cerrado
     │              │                │
     └──────────────┴────────────────┴──► cerrado   (cierre anticipado justificado)
```

- No se salta de `pendiente` a `verificado` sin pasar por el flujo de KYC (salvo excepción documentada por admin).
- De `pendiente` se puede ir a `cerrado` si el caso no procede (fuera de alcance, duplicado, etc.) con motivo interno.

## Creación (web pública)

1. Formulario: nombre familiar, email, teléfono opcional, nombre de la persona buscada/fallecida, relación, descripción.
2. Validación de campos y email.
3. Generación de **código de seguimiento** (`HUE-YYYY-XXXXXX`).
4. Persistencia en estado `pendiente`.
5. Correo de confirmación con código + enlace de tracking.
6. **No** se solicita KYC en este paso.

## Consulta (tracking sin login)

- Entrada: código o enlace firmado.
- Salida pública: estado, fechas, mensaje público.
- No se exponen notas internas ni datos de otros casos.

## Qué ve el familiar según estado

- **pendiente**: confirmación de recepción.
- **sin_verificar**: aviso de que debe completar verificación (y que el enlace fue enviado por email).
- **verificado**: confirmación de identidad verificada; el equipo continúa.
- **cerrado**: cierre del proceso y, si existe, mensaje público del operador.

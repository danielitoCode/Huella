# Política de peticiones de usuario (familiares)

## Objetivo

Definir el ciclo de vida de una solicitud y qué ve el familiar en cada estado, sin cuenta de usuario.

## Estados (vista familiar)

| Estado | Quién lo provoca | Significado para el familiar |
|--------|------------------|------------------------------|
| `pendiente` | Sistema al crear | Solicitud recibida; en espera de revisión |
| `sin_verificar` | Operador al **atender** | Caso en atención; puede completar verificación Didit o contactar verificación asistida |
| `verificado` | Didit (webhook) **o** operador (manual) | Identidad confirmada; continúa la investigación |
| `cerrado` | Operador | Expediente finalizado |
| `cancelada` | Operador (con PIN) | Solicitud cancelada |

## Transiciones (resumen)

```text
pendiente ──► sin_verificar ──► verificado ──► cerrado
                 │                  │
                 ├──────────────────┴──► cerrado
                 │
                 └──► cancelada ◄── pendiente / verificado
```

## Creación (web pública)

1. Formulario: nombre familiar, email, teléfono opcional, nombre de la persona buscada, relación, descripción/contexto.
2. Validación de campos y email.
3. Código de seguimiento `HUE-YYYY-XXXXXX`.
4. Persistencia en `pendiente`.
5. Correo HTML de confirmación con código + enlace de tracking.
6. **No** se solicita KYC ni login en este paso.

## Consulta (tracking sin login)

- Entrada: código de seguimiento.
- Salida pública: estado, fechas, mensaje público.
- En `sin_verificar`, además:
  - Enlace Didit (`verificationUrl`) si existe sesión generada.
  - Contacto de **verificación asistida** (operador / equipo) desde variables de entorno públicas de contacto.
- No se exponen notas internas, PIN, ni datos de otros casos.

## Qué ve el familiar según estado

| Estado | UI pública |
|--------|------------|
| `pendiente` | Confirmación de recepción |
| `sin_verificar` | CTA Didit (si hay URL) + bloque de contacto asistido |
| `verificado` | Identidad verificada; el equipo continúa |
| `cerrado` | Cierre + mensaje público opcional |
| `cancelada` | Aviso de cancelación |

## Correos al familiar

- Alta: plantilla tracking (código + enlace).
- KYC: plantilla memorial con botón Didit + bloque de verificación asistida.
- El operador puede **reenviar** el email o **copiar HTML** de la misma plantilla desde el backoffice.

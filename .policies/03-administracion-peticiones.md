# Política de administración de peticiones

## Objetivo

Reglas para que el operador mueva una solicitud entre los estados canónicos y dispare KYC en el momento correcto.

## Momento clave: `pendiente` → `sin_verificar`

Se marca **Sin verificar** cuando el operador confirma que:

- se ha localizado información relevante sobre la persona buscada (fallecida o no), **y/o**
- se ha establecido contacto con el familiar / se inician negociaciones o gestiones formales.

Al confirmar esa transición el sistema **debe**:

1. Cambiar estado a `sin_verificar`.
2. Crear sesión KYC en Didit.
3. Enviar al familiar el enlace de verificación por email.
4. Registrar auditoría (quién, cuándo, motivo/nota).

No se envía KYC en `pendiente` ni de forma masiva automática sin esta confirmación humana (salvo reglas futuras explícitas).

## `sin_verificar` → `verificado`

- Preferente: webhook de Didit con resultado Approved.
- El operador no debería marcar “verificado” a mano salvo contingencia documentada (fallo de webhook + evidencia).

## → `cerrado`

- Desde cualquier estado, con **motivo interno** obligatorio.
- Mensaje público opcional para el tracking y el correo de cierre.
- Cerrar desde `pendiente` implica que no se llegó a negociaciones (no procede, duplicado, etc.).

## Visibilidad

| Dato | Familiar | Operador |
|------|----------|----------|
| Estado | Sí | Sí |
| Mensaje público | Sí | Sí |
| Notas internas | No | Sí |
| Detalle KYC Didit | No (solo verificado / pendiente de verificar) | Sí |

## Auditoría

Todo cambio de estado: `actor`, `timestamp`, `estadoAnterior`, `estadoNuevo`, `motivo` cuando aplique.

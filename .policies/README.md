# Políticas de dominio — Huella

Fuente de verdad de reglas de negocio y seguridad.
Cualquier cambio de estados, KYC o autenticación se documenta aquí **antes** de tocar código.

## Documentos

| Archivo | Alcance |
|---------|---------|
| [01-peticiones-usuario.md](./01-peticiones-usuario.md) | Ciclo de vida y estados de una solicitud |
| [02-autenticacion.md](./02-autenticacion.md) | Tracking sin login + autenticación de operadores |
| [03-administracion-peticiones.md](./03-administracion-peticiones.md) | Transiciones, aceptación de contacto y cierre |
| [04-kyc-didit.md](./04-kyc-didit.md) | Verificación de identidad (Didit) al pasar a *Sin verificar* |
| [05-arquitectura.md](./05-arquitectura.md) | Clean Architecture feature-first, capas y DI |

## Estados canónicos de una solicitud

```
pendiente → sin_verificar → verificado → cerrado
```

| Estado | Propósito |
|--------|-----------|
| `pendiente` | Solicitud recién enviada por el familiar; aún no hay contacto confirmado con el caso |
| `sin_verificar` | Se confirmó hallazgo / contacto con el familiar (o persona de interés) y se inician negociaciones; se dispara KYC |
| `verificado` | El familiar completó la verificación de identidad (Didit) |
| `cerrado` | El proceso terminó (con o sin resolución favorable) |

## Principios

1. Mínima fricción al enviar (sin login, sin KYC inicial).
2. KYC solo cuando el caso pasa a `sin_verificar`.
3. Tracking por código para el familiar.
4. Dominio y casos de uso independientes de UI e infraestructura.

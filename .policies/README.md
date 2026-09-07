# Políticas de dominio — Huella

Fuente de verdad de reglas de negocio y seguridad.
Cualquier cambio de estados, verificación, usuarios o autenticación se documenta aquí **antes** de tocar código.

## Documentos

| Archivo | Alcance |
|---------|---------|
| [01-peticiones-usuario.md](./01-peticiones-usuario.md) | Ciclo de vida y tracking público |
| [02-autenticacion.md](./02-autenticacion.md) | Tracking sin login + sesión de operadores |
| [03-administracion-peticiones.md](./03-administracion-peticiones.md) | Transiciones de estado, cierre y cancelación |
| [04-kyc-didit.md](./04-kyc-didit.md) | Verificación Didit **y** verificación manual |
| [05-arquitectura.md](./05-arquitectura.md) | Clean Architecture feature-first |
| [06-appwrite-env.md](./06-appwrite-env.md) | Variables y colecciones Appwrite |
| [07-usuarios-operadores.md](./07-usuarios-operadores.md) | Cuentas, roles, passwords y PINs de cancelación |

## Estados canónicos de una solicitud

```text
pendiente → sin_verificar → verificado → cerrado
                │
                └── (también) → cerrado | cancelada
pendiente ─────────────────────────────→ cancelada
```

| Estado | Propósito |
|--------|-----------|
| `pendiente` | Solicitud recién enviada; en cola de atención |
| `sin_verificar` | **Atendida** por operador; identidad del solicitante aún no confirmada |
| `verificado` | Identidad confirmada (Didit **o** vía manual documentada) |
| `cerrado` | Proceso llevado a término |
| `cancelada` | Descartada con PIN personal del operador + motivo |

## Principios

1. Mínima fricción al enviar (sin login de familiar, sin KYC inicial).
2. Producto orientado a **averiguación de familiares**; la gestión de primas es offline/condicional y no se procesa en la app.
3. KYC Didit **opcional** al atender; disponible también en tracking y por correo.
4. Verificación **manual** legítima (baja conectividad / vías extraoficiales) con motivo obligatorio.
5. Tracking por código para el familiar.
6. Operadores gestionados en colección `operadores` (sin `ADMIN_USER_IDS` ni PIN global en env).
7. Admin **resetea** credenciales; el titular **establece** las suyas.

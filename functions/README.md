# Functions — Huella (Appwrite)

Plan Free: **máximo 2 Functions**. Arquitectura modular por dominio de API.

```
functions/
├── huella-api/          # API de acciones (cliente → backend)
│   └── actions:
│       solicitudes.create | getByCode | marcarSinVerificar
│       didit.createSession
│       email.send
└── huella-webhooks/     # Gateway webhooks externos
    └── providers:
        didit (stripe preparado)
```

## Principio

- **NO** una Function por endpoint.
- Nueva capacidad = **módulo + ruta**, no nueva Function.

## Dominio

Estados solicitud: `pendiente` → `sin_verificar` → `verificado` → `cerrado`

KYC (Didit) se dispara en `solicitudes.marcarSinVerificar` (operador).
El webhook Didit es la **fuente de verdad** para pasar a `verificado`.

## Deploy (Console Appwrite)

1. Crear Function `huella-api` · Node 18+ · entrypoint `src/index.js` · root `functions/huella-api`
2. Crear Function `huella-webhooks` · igual con root `functions/huella-webhooks`
3. Variables de entorno (ver README de cada una)
4. Execute permissions: `huella-api` → `any` + users; `huella-webhooks` → `any`

## Colecciones extra

### `kyc_verifications`
| Campo | Tipo | Required |
| solicitud_id | varchar 36 | sí |
| user_id | varchar 36 | no |
| didit_session_id | varchar 64 | sí |
| status | varchar 32 | sí |
| codigo_seguimiento | varchar 32 | no |
| verified_at | datetime | no |

### `webhook_events`
| event_id | varchar 128 unique |
| provider | varchar 32 |

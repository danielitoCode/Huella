# Functions — Huella (Appwrite)

Plan Free: **máximo 2 Functions**. Arquitectura modular por dominio de API.

```
functions/
├── huella-api/          # API de acciones (cliente → backend)
└── huella-webhooks/     # Gateway webhooks externos
```

## Pruebas locales (antes de desplegar)

Cada function tiene su propio `package.json`, Vitest y CI.

```bash
# Solo API
cd functions/huella-api && npm install && npm test

# Solo webhooks
cd functions/huella-webhooks && npm install && npm test

# Desde la raíz del monorepo
npm run test:api
npm run test:webhooks
npm run test:functions   # ambas
npm run test:all         # web + functions
```

## CI

| Workflow | Responsabilidad |
|----------|-----------------|
| `CI` | Gate global: jobs `web` + `huella-api` + `huella-webhooks` (todos deben pasar) |
| `CI web` | Solo frontend (path filter) |
| `CI huella-api` | Solo API (path filter) |
| `CI huella-webhooks` | Solo webhooks (path filter) |

En branch protection de `master`, exigir los checks del workflow **CI** (`web`, `huella-api`, `huella-webhooks`).

## Deploy

Solo después de tests verdes en local y CI:

1. Console Appwrite → crear/actualizar Function
2. Root: `functions/huella-api` o `functions/huella-webhooks`
3. Entrypoint: `src/index.js`
4. Variables de entorno (ver README de cada una)

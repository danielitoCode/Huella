# Cloudflare Workers — Huella

Inspirado en `dash_alejo_taller/workers` (wrangler + edge) y `password_reset` (Users admin con API key).

## Arquitectura

```
Front (Svelte)
 ├─ Appwrite SDK  → Auth, create/list/update solicitudes
 └─ fetch Worker  → operadores.*, getByCode, cancelar+PIN, Didit, email

Didit ──webhook──► huella-webhooks Worker ──► Appwrite DB
```

## Deploy huella-api

```bash
cd workers/huella-api
npm install
npx wrangler login
npx wrangler secret put APPWRITE_API_KEY
npx wrangler secret put APPWRITE_ENDPOINT
npx wrangler secret put APPWRITE_PROJECT_ID
npx wrangler secret put PIN_SALT
# opcionales: DIDIT_API_KEY, RESEND_API_KEY, CORS_ORIGINS, …
npx wrangler deploy
```

Variables no secretas también en Dashboard → Settings → Variables.

## Deploy huella-webhooks

```bash
cd workers/huella-webhooks
npm install
npx wrangler secret put APPWRITE_API_KEY
# …
npx wrangler deploy
```

URL del webhook en Didit: `https://huella-webhooks.<sub>.workers.dev`

## Front

```
VITE_API_BASE_URL=https://huella-api.<sub>.workers.dev
```

## Permisos Appwrite (colección solicitudes)

| Operación | Permission sugerido |
|-----------|---------------------|
| create (formulario público) | `create("any")` |
| read/update (backoffice) | role/label users team o `read("users")` / `update("users")` si todos los logueados son operadores |
| Documentos sensibles | no exponer `notasInternas` a `any` |

`getByCode` sigue en el Worker porque “quien tiene el código” no se modela bien solo con permisos.

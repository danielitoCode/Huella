# Cloudflare Workers — Huella

Patrón inspirado en `dash_alejo_taller/workers` + `functions/password_reset` (Users admin con API key).

## Reparto de responsabilidades

| Capa | Qué |
|------|-----|
| **SDK Appwrite (browser)** | Auth, `solicitudes.create`, list/get, cambios de estado sin PIN |
| **Worker `huella-api`** | `operadores.*`, `solicitudes.getByCode`, `solicitudes.cancelar`+PIN, Didit, email |
| **Worker `huella-webhooks`** | Webhooks Didit |

## Deploy

```bash
cd workers/huella-api
npm install
npx wrangler login
npx wrangler secret put APPWRITE_API_KEY
# … resto de secrets en Dashboard o wrangler secret put
npx wrangler deploy

cd ../huella-webhooks
npm install
npx wrangler deploy
```

Frontend:

```
VITE_API_BASE_URL=https://huella-api.<subdomain>.workers.dev
```

Didit webhook URL:

```
https://huella-webhooks.<subdomain>.workers.dev
```

## Cold start

Workers en el edge: scale to zero real, cold start típico **muy bajo** (ms–pocos cientos ms), sin sleep de contenedor tipo Render Free.

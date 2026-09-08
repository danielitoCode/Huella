# Deploy Workers Huella (Cloudflare)

## Error `root directory not found`

Eso pasa si el **Git integration** apunta a una ruta que **no existe en la branch conectada**.

Comprueba:

1. Branch = **`core1`** (donde está `workers/`)
2. Root directory exacto:
   - `workers/huella-api`
   - `workers/huella-webhooks`
3. Sin slash inicial (`/workers/...` a veces falla)

**Recomendado:** deploy por **CLI** (evita el fallo de root del dashboard Git):

```bash
cd workers/huella-api
npm install
npx wrangler login
npx wrangler secret put APPWRITE_ENDPOINT
npx wrangler secret put APPWRITE_PROJECT_ID
npx wrangler secret put APPWRITE_API_KEY
npx wrangler secret put PIN_SALT
npx wrangler secret put CORS_ORIGINS
# …
npx wrangler deploy
```

## Auth (igual que list_users)

El front envía JWT:

```
Authorization: Bearer <jwt>
# o
x-appwrite-user-jwt: <jwt>
```

El Worker hace `Account.get()` con ese JWT y exige label `admin` / `operador`.

Tu usuario debe tener en Appwrite Auth el label **`admin`**.

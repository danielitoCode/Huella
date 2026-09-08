# huella-api (Render Web Service)

API modular de Huella. **Appwrite** se usa solo como Auth + Database.
Las ejecuciones van en **Render** (sin límite Free de Appwrite Functions).

## Contrato

```http
POST /
Content-Type: application/json
Authorization: Bearer <jwt-appwrite>   # rutas autenticadas

{ "action": "solicitudes.list", "payload": { "limit": 20 } }
```

Respuesta: `{ "success": true, "data": ... }` o `{ "success": false, "error": { "code", "message" } }`.

## Deploy en Render

1. New → **Web Service** → repo Huella, branch `core1` (o `master` cuando merges).
2. Configuración:

| Campo | Valor |
|--------|--------|
| **Root Directory** | `functions/huella-api` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance** | Free (o Starter) |
| **Health Check Path** | `/` |

3. **Environment** (mismas vars que tenías en Appwrite Function):

```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...          # scopes: databases, users
APPWRITE_DATABASE_ID=huella
APPWRITE_COLLECTION_SOLICITUDES=solicitudes
APPWRITE_COLLECTION_KYC=kyc_verifications
APPWRITE_COLLECTION_OPERADORES=operadores
PUBLIC_APP_URL=https://tu-site...
CORS_ORIGINS=https://tu-site...,http://localhost:5173
PIN_SALT=...
DIDIT_API_KEY=...
DIDIT_WORKFLOW_ID=...
RESEND_API_KEY=...
EMAIL_FROM=...
OPERATOR_CONTACT_NAME=...
OPERATOR_CONTACT_EMAIL=...
```

4. Copia la URL pública (`https://huella-api-xxxx.onrender.com`) → frontend:

```
VITE_API_BASE_URL=https://huella-api-xxxx.onrender.com
```

## Local

```bash
cd functions/huella-api
cp ../../.env.example .env   # o exporta vars
npm install
npm start
# http://localhost:10000
```

## Nota Free de Render

El plan free **duerme** tras inactividad (~15 min). La primera petición puede tardar 30–60 s (cold start). No tiene el tope mensual de executions de Appwrite Free.

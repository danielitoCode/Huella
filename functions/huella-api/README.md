# huella-api

API modular server-side de Huella (1 Appwrite Function).

## Deploy en Appwrite (importante)

### Opción A — Git

| Campo | Valor |
|--------|--------|
| **Root directory** | `functions/huella-api` |
| **Entrypoint** | `index.js` (o `src/index.js`) |
| **Install command** | `npm install` |
| **Build command** | *(vacío)* |
| **Runtime** | Node.js 18 o 20 |

Si el Root directory queda vacío o es la raíz del repo, Appwrite busca `src/index.js` en la raíz de Huella y falla con:
`Failed to load entrypoint, file src/index.js does not exist`.

### Opción B — Manual (CLI / zip)

Empaqueta **el contenido** de `functions/huella-api` (debe verse `index.js`, `src/`, `package.json` en la raíz del zip):

```bash
cd functions/huella-api
# appwrite deploy function  — o zip desde aquí
```

## Acciones

| action | auth | Descripción |
|--------|------|-------------|
| `solicitudes.*` | public / admin | Solicitudes y estados |
| `operadores.*` | admin | Usuarios, roles, PIN, password |
| `didit.createSession` | admin | Sesión Didit |
| `email.send` | admin | Email |

## Extender

1. `modules/<ns>/`
2. Registrar en `router/routes.js`
3. Redeploy — **sin nueva Function**

## Env

```
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
APPWRITE_COLLECTION_SOLICITUDES_ID=solicitudes
APPWRITE_COLLECTION_KYC_ID=kyc_verifications
APPWRITE_COLLECTION_OPERADORES=operadores
PUBLIC_APP_URL
DIDIT_API_KEY
DIDIT_WORKFLOW_ID
PIN_SALT
RESEND_API_KEY
EMAIL_FROM
OPERATOR_CONTACT_NAME
OPERATOR_CONTACT_EMAIL
```

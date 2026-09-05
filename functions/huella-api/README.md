# huella-api

API modular server-side de Huella (1 Appwrite Function).

## Acciones

| action | auth | Descripción |
|--------|------|-------------|
| `solicitudes.create` | public | Alta de solicitud + código tracking |
| `solicitudes.getByCode` | public | Tracking por código |
| `solicitudes.marcarSinVerificar` | admin | Contacto confirmado → KYC Didit + email |
| `didit.createSession` | admin | Crea sesión Didit vinculada a solicitud |
| `email.send` | admin | Envío de email (templates) |

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
PUBLIC_APP_URL
DIDIT_API_KEY
DIDIT_WORKFLOW_ID
ADMIN_USER_IDS=id1,id2
RESEND_API_KEY
EMAIL_FROM
```

Entrypoint: `src/index.js` · Runtime: Node 18+

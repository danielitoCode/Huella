# huella-webhooks

Gateway modular de webhooks (1 Appwrite Function).

## Rutas

| Path | Provider |
|------|----------|
| `POST /webhooks/didit` | Didit KYC |
| `POST /webhooks/stripe` | Stub (futuro) |

## Env

```
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
APPWRITE_COLLECTION_SOLICITUDES_ID=solicitudes
APPWRITE_COLLECTION_KYC_ID=kyc_verifications
APPWRITE_COLLECTION_WEBHOOK_EVENTS_ID=webhook_events
DIDIT_WEBHOOK_SECRET
```

Entrypoint: `src/index.js`

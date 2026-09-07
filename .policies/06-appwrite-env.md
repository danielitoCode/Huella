# Appwrite — entorno y colecciones (resumen de políticas)

## Frontend (`VITE_*`)

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_FUNCTION_API_ID` (huella-api)

## Function `huella-api`

| Variable | Uso |
|----------|-----|
| `APPWRITE_ENDPOINT` / `PROJECT_ID` / `API_KEY` | Admin SDK (DB + Users) |
| `APPWRITE_DATABASE_ID` | p. ej. `huella` |
| `APPWRITE_COLLECTION_SOLICITUDES` | solicitudes |
| `APPWRITE_COLLECTION_KYC` | kyc_verifications |
| `APPWRITE_COLLECTION_OPERADORES` | operadores |
| `PUBLIC_APP_URL` | Enlaces en emails |
| `PIN_SALT` | Hash de PIN de cancelación |
| `OPERATOR_CONTACT_*` | Nombre, email, teléfono, nota (tracking + emails) |
| `DIDIT_*` | KYC |
| `RESEND_API_KEY` / `EMAIL_FROM` | Correo |

### Explicitamente **no** usar

- `ADMIN_USER_IDS` — roles solo en colección `operadores`.
- `BACKOFFICE_CANCEL_PIN` — PIN solo por operador.

## Atributos recomendados extra

**solicitudes:** `diditVerificationUrl` (varchar, opcional).

**operadores:** `mustChangePassword` (text `true`/`false`).

## Functions

- `huella-api`: API modular (`solicitudes.*`, `operadores.*`, `didit.*`, `email.*`).
- `huella-webhooks`: Didit (y futuros proveedores).

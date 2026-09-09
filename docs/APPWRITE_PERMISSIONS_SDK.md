# Permisos Appwrite — flujo sin Worker (Core1Fix)

## Colección `solicitudes`

| Acción | Quién |
|--------|--------|
| **Create** | `any` (formulario público) |
| **Read** | `any` (seguimiento por código) **o** al menos documentos con `read("any")` |
| **Update** | `users` (operadores autenticados) |
| **Delete** | `users` / admin |

Los documentos creados por la app llevan:

- `Permission.read(Role.any())`
- `Permission.update(Role.users())`
- `Permission.delete(Role.users())`

### Documentos ya existentes

Si el seguimiento público falla con 401/403, en la consola Appwrite actualiza permisos del documento (o de la colección) para permitir **Read → Any**.

Índice recomendado: `codigoSeguimiento` (key, unique si aplica).

## Variables front (mínimas)

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=...
VITE_APPWRITE_DATABASE_ID=huella
VITE_APPWRITE_COLLECTION_SOLICITUDES_ID=solicitudes
# Opcional contacto en seguimiento:
VITE_OPERATOR_CONTACT_NAME=Equipo Huella
VITE_OPERATOR_CONTACT_EMAIL=...
VITE_OPERATOR_CONTACT_PHONE=...
```

**Ya no es obligatorio** `VITE_API_BASE_URL` para solicitudes ni seguimiento.

## Qué hace el SDK

| Flujo | Método |
|-------|--------|
| Alta pública | `createDocument` |
| Seguimiento | `listDocuments` + `Query.equal('codigoSeguimiento', code)` |
| Listado admin | `listDocuments` (sesión operador) |
| Detalle / estados | `getDocument` / `updateDocument` |

Didit, email Resend y PIN de cancelación quedan **fuera** de este fix (congelados).

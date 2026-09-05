# Appwrite — variables de entorno y sincronización local

## Objetivo

Conectar el frontend (Vite) y el backend lógico (functions / node-appwrite) al proyecto Appwrite sin secretos en el código.

## Archivos

| Archivo | Uso |
|---------|-----|
| `.env.example` | Plantilla versionada (sin secretos) |
| `.env` | Copia local (gitignored) |

```bash
cp .env.example .env
# editar .env con valores de la Console
```

## Dónde obtener cada valor (Appwrite Console)

| Variable | Dónde |
|----------|--------|
| `VITE_APPWRITE_ENDPOINT` / `APPWRITE_ENDPOINT` | Project **Settings** → API endpoint (`https://<REGION>.cloud.appwrite.io/v1`) |
| `VITE_APPWRITE_PROJECT_ID` / `APPWRITE_PROJECT_ID` | Project **Settings** → Project ID |
| `APPWRITE_API_KEY` | **Overview → Integrations → API keys** (scopes: databases, users, etc. según necesidad) |
| `VITE_APPWRITE_DEV_KEY` (opcional) | **Overview → Integrations → Dev keys** (solo local) |
| IDs de database/collections | **Databases** → copiar IDs |

## Plataforma Web obligatoria

En el proyecto Appwrite: **Add platform → Web** con hostname `localhost` (y el dominio de producción cuando exista). Sin esto, el navegador recibe errores CORS.

## Separación cliente / servidor

| Prefijo | Visible en el navegador | Uso |
|---------|-------------------------|-----|
| `VITE_*` | Sí (`import.meta.env`) | Endpoint, project ID, IDs de colección si hay permisos de lectura públicos/documentales |
| Sin `VITE_` | No | `APPWRITE_API_KEY`, Didit, email, JWT |

La **API Key de servidor no debe** usarse en el frontend. El front usa el Web SDK con sesión de usuario o permisos de colección; operaciones privilegiadas van en functions Appwrite o backend con `APPWRITE_API_KEY`.

## Functions en Appwrite Cloud

En runtime Appwrite inyecta:

- `APPWRITE_FUNCTION_API_ENDPOINT`
- `APPWRITE_FUNCTION_PROJECT_ID`
- header `x-appwrite-key` (dynamic key)

Para desarrollo local de functions, reutiliza `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID` y `APPWRITE_API_KEY` del `.env`.

## Relación con el dominio Huella

Los adaptadores de infrastructure implementarán `SolicitudRepository`, `KycProvider` y `EmailNotifier` contra Appwrite (y Didit/email). Las variables de database/collection alimentan esos adaptadores.

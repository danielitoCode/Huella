# Backend Huella

## Arquitectura actual

| Pieza | Dónde | Rol |
|-------|--------|-----|
| **Auth + Database** | Appwrite | Login operadores, colecciones |
| **API de negocio** | **Render** (`huella-api`) | `solicitudes.*`, `operadores.*`, Didit, email |
| **Webhooks** | Render (recomendado) o Appwrite Function | Didit callbacks |

Appwrite **Functions** se dejan de usar en producción por el tope Free (402).

## Deploy rápido — huella-api en Render

1. [Render Dashboard](https://dashboard.render.com) → **New Web Service**
2. Conecta el repo GitHub `Huella`, branch `core1`
3. Settings:
   - **Root Directory:** `functions/huella-api`
   - **Build:** `npm install`
   - **Start:** `npm start`
4. Pega las env de servidor (ver `huella-api/README.md`)
5. Tras el deploy, URL tipo `https://huella-api-xxxx.onrender.com`
6. En el frontend / Site Appwrite:
   ```
   VITE_API_BASE_URL=https://huella-api-xxxx.onrender.com
   ```
7. Rebuild del sitio estático

## Carpetas legacy

`auth/`, `email/`, `kyc/`, `solicitudes/` — experimentos previos; la API unificada está en **`huella-api`**.

# Huella

Plataforma de apoyo a familiares cubanos afectados por el conflicto Rusia-Ucrania.

## Estados de una solicitud

```
pendiente → sin_verificar → verificado → cerrado
                 ↘ cancelada
```

| Estado | Significado |
|--------|-------------|
| **pendiente** | Solicitud recibida vía formulario público. |
| **sin_verificar** | Caso en atención; pendiente verificar identidad. |
| **verificado** | Identidad confirmada. |
| **cerrado** | Proceso finalizado. |
| **cancelada** | Expediente anulado. |

---

## Stack

- **Frontend**: Svelte 5, TypeScript, Vite
- **Backend**: **Supabase** (Auth + PostgreSQL + RLS)
- **KYC** (futuro): Didit vía Edge Functions / secrets

## Arquitectura

Clean Architecture **feature-first**:

```
src/
  core/features/<feature>/   # domain / data / di / ui
  lib/supabase/              # cliente singleton
  lib/data/repositories/     # facades hacia Supabase
  pages/public|admin/
.policies/
.roadmap/mvp/
```

## Variables de entorno

```bash
cp .env.example .env
```

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (nunca service_role)
- `VITE_PUBLIC_APP_URL`

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run ci
```

> Appwrite y el worker `huella-api` ya no forman parte del cliente. Carpetas `functions/` y `workers/` pueden quedar como legado histórico hasta limpiar el repo por completo.

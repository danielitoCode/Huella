# Huella

Plataforma de apoyo a familiares cubanos afectados por el conflicto Rusia-Ucrania.

## Estados de una solicitud

```
pendiente → sin_verificar → verificado → cerrado
```

| Estado | Significado |
|--------|-------------|
| **pendiente** | Solicitud recibida vía formulario público. |
| **sin_verificar** | Contacto/hallazgo confirmado por operador; se inicia KYC con Didit. |
| **verificado** | Identidad del familiar confirmada por el webhook Didit. |
| **cerrado** | Proceso finalizado por el operador con motivo registrado. |

> **Nota**: El proceso de KYC (verificación de identidad) **no** se requiere al enviar la solicitud inicial, únicamente cuando un operador la pasa al estado `sin_verificar`.

---

## Arquitectura

Clean Architecture **feature-first** (Svelte 5 + Appwrite BaaS):

```
src/
  components/              # Componentes de UI (Header, Layout, Modals)
  core/features/<feature>/ # Dominio y casos de uso en código puro
  lib/
    appwrite/              # Cliente SDK singleton y ejecutor de Functions
    stores/                # Stores de Svelte (router, sesión)
  pages/
    public/                # Home, CrearSolicitud, Tracking
    admin/                 # Login, Dashboard, Solicitudes (listado/detalle)
functions/
  huella-api/              # Function Serverless para operaciones API
  huella-webhooks/         # Function Serverless para webhooks (Didit, etc.)
.policies/                 # Reglas de negocio y especificaciones de dominio
.roadmap/                  # Roadmap y checklists del proyecto (core1)
```

---

## Configuración y Variables de Entorno

Copiar `.env.example` a `.env` y configurar las variables correspondientes:

```bash
cp .env.example .env
```

### Variables para el Frontend (Vite)
- `VITE_APPWRITE_ENDPOINT`: Endpoint de la instancia Appwrite (ej. `https://cloud.appwrite.io/v1`)
- `VITE_APPWRITE_PROJECT_ID`: ID del proyecto Appwrite
- `VITE_APPWRITE_FUNCTION_API_ID`: ID de la function `huella-api` en Appwrite Console

### Variables para Serverless Functions (`huella-api`, `huella-webhooks`)
- `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`, `APPWRITE_COLLECTION_SOLICITUDES_ID`, `APPWRITE_COLLECTION_KYC_ID`, `APPWRITE_COLLECTION_WEBHOOK_EVENTS_ID`
- `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`
- `ADMIN_USER_IDS`: Comma-separated list de Appwrite User IDs autorizados como operadores admin.

---

## Desarrollo Local

### 1. Frontend
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Vite)
npm run dev

# Correr tests unitarios del frontend
npm test
```

### 2. Serverless Functions

#### `huella-api`
```bash
cd functions/huella-api
npm install
npm test
```

#### `huella-webhooks`
```bash
cd functions/huella-webhooks
npm install
npm test
```

---

## Despliegue de Serverless Functions en Appwrite BaaS

1. Crear las dos funciones en **Appwrite Console -> Functions**:
   - `huella-api`: Entrypoint `src/index.js`, Node.js 18+ runtime.
   - `huella-webhooks`: Entrypoint `src/index.js`, Node.js 18+ runtime.
2. Configurar las variables de entorno en la pestaña de variables de cada Function.
3. Otorgar permisos de ejecución a la función `huella-api` (`Any` para `solicitudes.create` y `solicitudes.getByCode`, `Users` autenticados para acciones admin).

---

## Stack Tecnológico

- **Frontend**: Svelte 5 (Runes `$state`, `$derived`), TypeScript, Vite.
- **Backend / BaaS**: Appwrite (Database, Account/Auth, Functions).
- **KYC**: Didit Decision API & Webhooks.
- **Testing**: Vitest (46 tests unitarios pasando en total).

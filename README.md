# Huella

Plataforma dirigida a familiares cubanos que han perdido seres queridos en la guerra Rusia-Ucrania.

## Arquitectura

El proyecto se divide en dos zonas principales:

### 1. Web pública (`/`) – Familiares / Clientes
- Información sobre la plataforma
- Formulario para enviar solicitudes
- Seguimiento de solicitudes (futuro)

### 2. Backoffice (`/admin`) – Operador / Administrador
- Login de acceso
- Dashboard con resumen
- Gestión de solicitudes recibidas
- Detalle y acciones sobre cada solicitud

## Estructura del código

```
src/
├── components/          # Componentes compartidos
│   ├── Header.svelte
│   └── Layout.svelte
├── lib/
│   ├── stores/
│   │   └── router.ts    # Navegación simple por estado
│   └── types.ts         # Tipos compartidos
├── pages/
│   ├── public/          # Zona de familiares
│   │   ├── Home.svelte
│   │   └── Solicitud.svelte
│   └── admin/           # Backoffice
│       ├── Login.svelte
│       ├── Dashboard.svelte
│       ├── Solicitudes.svelte
│       └── SolicitudDetalle.svelte
├── App.svelte
├── app.css
└── main.ts
```

## Desarrollo

```bash
npm install
npm run dev
```

## Stack

- Svelte 5 + TypeScript + Vite

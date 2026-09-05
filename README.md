# Huella

Plataforma de apoyo a familiares cubanos afectados por el conflicto Rusia-Ucrania.

## Estados de una solicitud

```
pendiente → sin_verificar → verificado → cerrado
```

| Estado | Significado |
|--------|-------------|
| **pendiente** | Solicitud recibida |
| **sin_verificar** | Contacto/hallazgo confirmado; se envía KYC (Didit) |
| **verificado** | Identidad confirmada |
| **cerrado** | Proceso finalizado |

KYC **no** se pide al enviar: solo al pasar a `sin_verificar`.

## Arquitectura

Clean Architecture **feature-first**:

```
src/
  core/features/<feature>/{domain,application,di}
  infrastructure/          # navegación, adaptadores generales, fakes de test
  pages/                   # UI Svelte
functions/                 # diseño de serverless (KYC, email, …)
.policies/                 # reglas de negocio
```

## Desarrollo

```bash
npm install
npm run dev
npm test
```

## Stack

- Svelte 5 + TypeScript + Vite
- Vitest (tests de dominio y casos de uso por feature)
- Didit (KYC) vía functions serverless

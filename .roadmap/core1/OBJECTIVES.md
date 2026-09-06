# Core 1 — Objetivos por esquemas funcionales

## Propósito

Trabajar en la rama **`core1`** hasta cerrar esquemas demostrables. `master` solo recibe merges cuando un esquema (o el cierre del ciclo) está completo.

Stack acordado:

- Svelte 5 + Vite + TypeScript
- Appwrite (Auth, DB, Functions, Sites)
- 2 functions: `huella-api`, `huella-webhooks`
- Didit KYC solo server-side + webhook como fuente de verdad
- Dominio y políticas en `src/core` y `.policies`

## Esquemas

| ID | Nombre | Dependencias | Estado |
|----|--------|--------------|--------|
| **F0** | Fundación | — | Cerrado |
| **A** | Solicitud pública + tracking | F0 | **Siguiente** |
| **B** | Auth operadores | F0 | Pendiente |
| **C** | Backoffice solicitudes | A, B | Pendiente |
| **D** | KYC Didit | C | Pendiente |
| **U** | UI/UX | A–D (flex) | Pendiente |
| **Z** | Cierre Core 1 | A–D | Pendiente |

Detalle de ítems: [CHECKLIST.md](./CHECKLIST.md).

## Definición de “esquema cerrado”

1. Todos los checkboxes del esquema en `[x]`
2. Flujo demostrable manualmente (o con tests)
3. Sin secretos en el frontend
4. Respeta estados: `pendiente` → `sin_verificar` → `verificado` → `cerrado`
5. CI del área en verde en `core1`

## Fuera de alcance Core 1 → core2+

- Pagos / Stripe
- App móvil
- Multi-idioma
- Analytics avanzado
- Más de 2 Appwrite Functions

## Siguiente paso

Implementar **esquema A** en `core1`: formulario → `solicitudes.create` → confirmación con código → tracking → `solicitudes.getByCode`.

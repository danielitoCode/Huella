# Core 1 — Objetivos (visión)

## Propósito del ciclo

Dejar de depender de mocks en el frontend y conectar el producto al stack acordado:

- **Appwrite** como BaaS (Auth, DB, Functions)
- **huella-api** / **huella-webhooks** como únicas functions (plan Free)
- **Didit** solo server-side + webhook como fuente de verdad KYC
- Dominio de **solicitudes** ya definido en `src/core` y políticas en `.policies`

## Objetivo de producto (medible)

Al cerrar Core 1, un operador puede gestionar un caso real de extremo a extremo y un familiar puede crear y seguir su solicitud **sin cuenta**, con estados canónicos:

`pendiente` → `sin_verificar` → `verificado` (→ `cerrado` cuando se implemente cierre en API).

## Fuera de alcance de Core 1 (posponer a core2+)

- Pagos / Stripe
- App móvil
- Multi-idioma
- Panel analytics avanzado
- Más de 2 Appwrite Functions
- Sustituir Svelte+Vite por otro framework

## Definición de “hecho” por ítem

Un checkbox del [CHECKLIST.md](./CHECKLIST.md) solo se marca si:

1. El comportamiento es demostrable (manual o test),
2. No hay secretos en el frontend,
3. Respeta estados y políticas de dominio,
4. El PR asociado a master tiene CI en verde.

## Siguiente paso inmediato

1. Mergear este roadmap a `master` (objetivo **0.3**).
2. Completar **§1 Fundación Appwrite** en la Console.
3. Implementar **§2–§4** en la rama `core1` y abrir PR de “alta + tracking reales”.

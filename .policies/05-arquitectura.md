# Arquitectura — Clean Architecture feature-first

## Objetivo

Código orientado a casos de uso y features, con dependencias hacia adentro (dominio no conoce UI ni HTTP).

## Estructura

```
src/
├── core/                          # Dominio + aplicación (features)
│   └── features/
│       └── solicitudes/
│           ├── domain/            # Entidades, VOs, reglas, puertos (interfaces)
│           ├── application/       # Casos de uso
│           └── di/                # Módulo DI de la feature
├── infrastructure/                # Detalles de app transversales
│   ├── navigation/                # Enrutado / router de la SPA
│   ├── http/                      # Clientes HTTP (futuro)
│   ├── didit/                     # Adaptador Didit (futuro)
│   └── di/                        # Composición raíz
├── pages/                         # UI (Svelte) — adaptadores de presentación
├── components/
└── main.ts
```

`functions/` en la raíz del repo sigue siendo el diseño/deploy de serverless (otra “infra” de ejecución).

## Regla de dependencias

```
pages / components  →  application (use cases)  →  domain
                              ↑
                    infrastructure (implementa puertos del domain)
```

- `domain` no importa de `application`, `infrastructure` ni `pages`.
- `application` solo conoce `domain` (y puertos).
- `infrastructure` implementa interfaces definidas en `domain` o puertos de aplicación.
- Cada feature expone un **módulo DI** que cablea sus casos de uso.

## Feature `solicitudes` — casos de uso

| Caso de uso | Actor | Efecto |
|-------------|-------|--------|
| `CrearSolicitud` | Familiar | Estado `pendiente` + código + email tracking |
| `ConsultarPorCodigo` | Familiar | Vista pública del estado |
| `MarcarSinVerificar` | Operador | `pendiente` → `sin_verificar` + sesión Didit + email KYC |
| `MarcarVerificado` | Sistema (webhook) | `sin_verificar` → `verificado` |
| `CerrarSolicitud` | Operador | → `cerrado` con motivo |

## Tests

- Vitest.
- Tests unitarios junto a la feature: `domain/**/*.test.ts`, `application/**/*.test.ts`.
- Dominio y casos de uso se prueban sin UI y con repositorios en memoria.

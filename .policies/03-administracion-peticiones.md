# Política de administración de peticiones (backoffice)

## Objetivo

Definir cómo un operador acepta, rechaza, actualiza o descarta una solicitud, y qué queda visible para el familiar.

## Estados y transiciones permitidas

```
pendiente ──► en_revision ──► en_proceso ──► resuelta
     │              │              │
     │              ├──────────────┴──► rechazada
     │              │
     └──────────────┴──────────────────► descartada
```

| Transición | Quién | Condición | Efecto hacia el familiar |
|------------|-------|-----------|---------------------------|
| `pendiente` → `en_revision` | Operador | Asume el caso | Correo: "Tu solicitud está en revisión" |
| `en_revision` → `en_proceso` | Operador | **Aceptación** | Correo: caso aceptado + posibles siguientes pasos |
| `en_revision` / `en_proceso` → `rechazada` | Operador | Motivo obligatorio (interno + mensaje público opcional) | Correo con mensaje genérico o el público definido |
| cualquiera → `descartada` | Operador o Admin | Motivo interno obligatorio (spam, duplicado, petición del titular, etc.) | No notificar, o mensaje neutro si ya había comunicación |
| `en_proceso` → `resuelta` | Operador | Cierre del caso | Correo de cierre |

## Aceptación

- Implica pasar a `en_proceso`.
- El operador puede dejar notas internas y mensajes públicos.
- Puede solicitar **KYC** al familiar en este punto (o antes, si el riesgo lo justifica). Ver política 04.

## Rechazo

- Motivo **interno** obligatorio (solo backoffice).
- Mensaje **público** opcional (lo que verá el familiar en el tracking y en el correo).
- Una vez rechazada, no se reabre automáticamente; se puede crear una nueva solicitud o reabrir manualmente por un admin con justificación.

## Descarte

Uso reservado para:

- Spam o contenido malicioso
- Duplicados evidentes
- Solicitud explícita de borrado por el titular
- Casos fuera de alcance de la plataforma

El descarte debe quedar en el log de auditoría. Los datos pueden anonimizarse según política de retención.

## Asignación

- Fase 1: cola compartida (cualquier operador puede tomar un caso).
- Fase 2: asignación explícita a un operador; solo él (o un admin) modifica el caso salvo escalado.

## Visibilidad

| Dato | Familiar (tracking) | Operador |
|------|---------------------|----------|
| Estado | Sí | Sí |
| Descripción original | Sí (la suya) | Sí |
| Notas internas | No | Sí |
| Mensajes públicos del operador | Sí | Sí |
| Resultado KYC detallado | No (solo “verificado” / “pendiente”) | Sí |
| Datos de otros casos | No | Según rol |

## Reglas de oro

1. Ningún cambio de estado sin registro de `quién` + `cuándo` + `motivo` (cuando aplique).
2. El familiar nunca ve notas internas.
3. El descarte no es un “borrado silencioso” sin traza: siempre hay auditoría.

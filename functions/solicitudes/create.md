# Function: `solicitudes/create`

## Propósito

Dar de alta una solicitud desde la web pública: validar, generar código de seguimiento, persistir y disparar el email de tracking.

## Trigger

- HTTP `POST` público (con rate limit y, idealmente, protección anti-bot).

## Input

```ts
{
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombreFallecido: string;
  relacion: string;
  descripcion: string;
}
```

## Flujo

1. Validar campos y formato de email.
2. Generar `codigoSeguimiento` único.
3. Persistir con `estado: 'pendiente'`, `estadoKyc: 'no_requerido'`.
4. Construir `trackingUrl`.
5. Invocar `email/send-tracking`.
6. Responder al cliente: `{ codigoSeguimiento, trackingUrl }` (sin datos internos).

## Errores

- `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`

## Políticas relacionadas

- `.policies/01-peticiones-usuario.md`

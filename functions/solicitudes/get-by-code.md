# Function: `solicitudes/get-by-code`

## Propósito

Exponer al familiar el estado de su solicitud mediante el código de seguimiento (o token de enlace).

## Trigger

- HTTP `GET` público, rate limited.
- Query/path: código o token.

## Output (solo campos públicos)

```ts
{
  codigoSeguimiento: string;
  estado: EstadoSolicitud;
  estadoKyc: EstadoKyc; // o versión simplificada: pendiente | verificado
  fechaCreacion: string;
  fechaActualizacion: string;
  mensajePublico?: string;
}
```

No devolver notas internas, email completo de más, IP, session Didit, etc.

## Errores

- `NOT_FOUND` (mismo mensaje genérico para no enumerar)
- `RATE_LIMITED`

## Políticas relacionadas

- `.policies/01-peticiones-usuario.md`
- `.policies/02-autenticacion.md`

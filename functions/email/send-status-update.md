# Function: `email/send-status-update`

## Propósito

Notificar al familiar un cambio de estado relevante de su solicitud.

## Trigger

- Invocada desde `solicitudes/admin-update` cuando el nuevo estado es notificable.

## Input

```ts
{
  to: string;
  nombreFamiliar: string;
  codigoSeguimiento: string;
  estadoAnterior: string;
  estadoNuevo: string;
  mensajePublico?: string;
  trackingUrl: string;
}
```

## Reglas

- No incluir notas internas.
- Para `descartada`, normalmente no se envía (o mensaje neutro según política 03).
- Idioma: español, tono respetuoso y claro.

## Políticas relacionadas

- `.policies/01-peticiones-usuario.md`
- `.policies/03-administracion-peticiones.md`

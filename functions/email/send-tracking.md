# Function: `email/send-tracking`

## Propósito

Enviar al familiar el correo de confirmación con el **código de seguimiento** y el enlace de consulta, justo después de crear la solicitud.

## Trigger

- Invocada por `solicitudes/create` (no expuesta públicamente de forma directa).

## Input

```ts
{
  to: string;
  nombreFamiliar: string;
  codigoSeguimiento: string;
  trackingUrl: string; // enlace firmado o /seguimiento/{codigo}
}
```

## Contenido mínimo del correo

- Asunto: confirmación de recepción + código
- Cuerpo: agradecimiento, código visible, botón/enlace de seguimiento, aviso de que no hace falta crear cuenta
- Sin datos internos ni de otros casos

## Políticas relacionadas

- `.policies/01-peticiones-usuario.md`

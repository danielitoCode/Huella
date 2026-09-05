# Function: `email/send-kyc-link`

## Propósito

Enviar al familiar el enlace del flujo hosted de Didit para completar la verificación de identidad.

## Trigger

- Invocada por `kyc/create-session`.

## Input

```ts
{
  to: string;
  nombreFamiliar: string;
  codigoSeguimiento: string;
  verificationUrl: string; // URL devuelta por Didit
}
```

## Contenido mínimo

- Explicar por qué se pide la verificación (brevemente, sin alarmar).
- Enlace claro y caducidad si aplica.
- Recordar que es un paso para avanzar en su caso.

## Políticas relacionadas

- `.policies/04-kyc-didit.md`

# Function: `solicitudes/admin-update`

## Propósito

Permitir al operador cambiar estado, notas internas, mensaje público y solicitar KYC.

## Trigger

- HTTP `PATCH`/`POST` **autenticado** (sesión de operador).

## Input (parcial)

```ts
{
  solicitudId: string;
  estado?: EstadoSolicitud;
  notasInternas?: string;
  mensajePublico?: string;
  solicitarKyc?: boolean;
}
```

## Flujo

1. Validar operador y permisos.
2. Validar transición de estado según política 03.
3. Persistir cambios + entrada de auditoría.
4. Si el estado es notificable → `email/send-status-update`.
5. Si `solicitarKyc === true` → invocar `kyc/create-session`.
6. Responder con la solicitud actualizada (vista admin).

## Políticas relacionadas

- `.policies/03-administracion-peticiones.md`
- `.policies/02-autenticacion.md`
- `.policies/04-kyc-didit.md`

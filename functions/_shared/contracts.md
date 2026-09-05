# Contratos compartidos (dominio)

Alineados con `.policies/` y con `src/core/features/solicitudes/domain`.

## Estados de solicitud

```ts
type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado';
```

## Solicitud

```ts
interface Solicitud {
  id: string;
  codigoSeguimiento: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombrePersona: string;       // buscada / fallecida / de interés
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  diditSessionId?: string;
  kycResultado?: 'approved' | 'declined' | 'expired' | 'failed';
  notasInternas?: string;
  mensajePublico?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
```

## Código de seguimiento

`HUE-YYYY-XXXXXX` — único, sin caracteres ambiguos.

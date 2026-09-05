# Contratos compartidos (dominio)

Tipos y formas de datos que usan varias functions. Deben mantenerse alineados con `.policies/` y con `src/lib/types.ts` del frontend.

## Solicitud

```ts
type EstadoSolicitud =
  | 'pendiente'
  | 'en_revision'
  | 'en_proceso'
  | 'resuelta'
  | 'rechazada'
  | 'descartada';

type EstadoKyc =
  | 'no_requerido'
  | 'solicitado'
  | 'en_progreso'
  | 'aprobado'
  | 'rechazado'
  | 'expirado';

interface Solicitud {
  id: string;
  codigoSeguimiento: string; // ej. HUE-2026-A7K9M2
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombreFallecido: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  estadoKyc: EstadoKyc;
  diditSessionId?: string;
  notasInternas?: string;
  mensajePublico?: string;
  fechaCreacion: string; // ISO
  fechaActualizacion: string; // ISO
  creadoPorIp?: string; // auditoría básica
}
```

## Código de seguimiento

- Prefijo: `HUE-`
- Año: `YYYY`
- Sufijo: 6 caracteres alfanuméricos (sin ambiguos: evitar 0/O, 1/I)
- Único en base de datos

## Respuestas de error estándar (functions)

```ts
interface FnError {
  code: string;      // ej. INVALID_CODE, UNAUTHORIZED, DIDIT_ERROR
  message: string;   // legible, sin secretos
  httpStatus: number;
}
```

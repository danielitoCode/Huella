/** Tipos compartidos de la plataforma Huella */

/** Estados canónicos de una solicitud (alineados con el dominio y huella-api). */
export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado';

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud' | 'seguimiento';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle';

/**
 * DTO de lectura pública de una solicitud (surface lista/detalle admin).
 * Refleja el contrato de `solicitudes.list` y `solicitudes.getById`.
 */
export type Solicitud = {
  id: string;
  codigoSeguimiento: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string | null;
  /** Nombre de la persona buscada */
  nombrePersona: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  mensajePublico?: string | null;
  /** Solo disponible en detalle (solicitudes.getById) */
  notasInternas?: string | null;
  diditSessionId?: string | null;
  kycResultado?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
};

/** Respuesta pública de solicitudes.getByCode */
export type SeguimientoPublico = {
  codigoSeguimiento: string;
  estado: EstadoSolicitud;
  mensajePublico: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  kycCompletado?: boolean;
};

/** Respuesta de solicitudes.create */
export type CreateSolicitudResult = {
  codigoSeguimiento: string;
  trackingUrl: string;
  estado: EstadoSolicitud;
  id: string;
};

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
 * Representación de lectura de una solicitud para superficies internas.
 *
 * No sustituye la entidad de dominio `core/features/solicitudes/domain/entities/Solicitud`;
 * es un contrato de UI/DTO para desacoplar las páginas de Svelte del modelo de dominio.
 */
export type Solicitud = {
  id: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombreFallecido: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  notasAdmin?: string;
  fechaCreacion: string;
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

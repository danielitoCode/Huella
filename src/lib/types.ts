/** Tipos compartidos de la plataforma Huella */

/** Estados de dominio (alineados con Appwrite / huella-api) */
export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado';

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud' | 'seguimiento';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle';

/** Modelo legacy usado temporalmente por las pantallas admin mock. */
export type Solicitud = {
  id: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombreFallecido: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud | 'en_revision' | 'en_proceso' | 'resuelta' | 'rechazada';
  fechaCreacion: string;
  notasAdmin?: string;
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

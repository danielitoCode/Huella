/** Tipos compartidos de la plataforma Huella */

/** Estados canónicos (Appwrite enum + huella-api). */
export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado'
  | 'cancelada';

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud' | 'seguimiento';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle';

export type Solicitud = {
  id: string;
  codigoSeguimiento: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string | null;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  mensajePublico?: string | null;
  notasInternas?: string | null;
  diditSessionId?: string | null;
  kycResultado?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
};

export type SeguimientoPublico = {
  codigoSeguimiento: string;
  estado: EstadoSolicitud;
  mensajePublico: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  kycCompletado?: boolean;
};

export type CreateSolicitudResult = {
  codigoSeguimiento: string;
  trackingUrl: string;
  estado: EstadoSolicitud;
  id: string;
};

export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  sin_verificar: 'Atendido · sin verificar',
  verificado: 'Verificado',
  cerrado: 'Cerrado',
  cancelada: 'Cancelada',
};

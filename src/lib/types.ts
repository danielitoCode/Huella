/** Tipos compartidos de la plataforma Huella */

export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado'
  | 'cancelada';

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud' | 'seguimiento';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle' | 'equipo';

export type OperatorContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
  note: string;
};

export type OperadorRol = 'admin' | 'operador';

export type Operador = {
  id: string;
  userId: string;
  email: string;
  nombre: string;
  rol: OperadorRol;
  activo: boolean;
  pinNeedsReset: boolean;
  pinEstado: 'reseteado_0000' | 'configurado' | string;
  /** Solo admin + PIN reseteado: valor de auditoría 0000 */
  pinVisibleAuditoria?: string;
  mustChangePassword: boolean;
  ultimoLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  passwordTemporal?: string;
  mensaje?: string;
};

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
  diditVerificationUrl?: string | null;
  kycResultado?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  operatorContact?: OperatorContact;
};

export type SeguimientoPublico = {
  codigoSeguimiento: string;
  estado: EstadoSolicitud;
  mensajePublico: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  kycCompletado?: boolean;
  verificationUrl?: string | null;
  operatorContact?: OperatorContact;
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

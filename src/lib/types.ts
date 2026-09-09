/** Tipos compartidos de la plataforma Huella */

export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado'
  | 'cancelada';

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud' | 'seguimiento' | 'terminos';
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
  /** Notas internas del operador (no visibles en seguimiento público). */
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

/** Etiquetas de UI — dominio: pendiente → atendido-sin verificar → verificado → cerrado | cancelada */
export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  sin_verificar: 'Atendido · no verificado',
  verificado: 'Verificado',
  cerrado: 'Cerrado (completado)',
  cancelada: 'Cancelada',
};

export const ESTADO_DESCRIPCION_OPERADOR: Record<EstadoSolicitud, string> = {
  pendiente: 'Solicitud recién registrada; aún no ha sido tomada por un operador.',
  sin_verificar: 'El caso está en atención; falta confirmar identidad del solicitante.',
  verificado: 'Identidad confirmada; investigación / gestión en curso.',
  cerrado: 'Proceso finalizado correctamente (averiguación y gestiones asociadas).',
  cancelada: 'Solicitud anulada; no continúa el proceso.',
};

/** Versión de los términos (actualizar al revisar el texto legal). */
export const TERMINOS_VERSION = '2026-09-09';

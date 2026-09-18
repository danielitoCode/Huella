/** Tipos compartidos de la plataforma Huella */

export type EstadoSolicitud =
  | 'pendiente'
  | 'sin_verificar'
  | 'verificado'
  | 'cerrado'
  | 'cancelada';

/** Valores del enum kyc_resultado en Supabase. */
export type KycResultado = 'approved' | 'declined' | 'expired' | 'failed';

export const KYC_RESULTADO_OPTIONS: { value: KycResultado; label: string }[] = [
  { value: 'approved', label: 'Aprobada (identidad confirmada)' },
  { value: 'declined', label: 'Rechazada (no coincide / no válida)' },
  { value: 'expired', label: 'Expirada (sesión o documento vencido)' },
  { value: 'failed', label: 'Fallida (error técnico o incompleta)' },
];

export const KYC_RESULTADO_LABEL: Record<KycResultado, string> = {
  approved: 'Aprobada',
  declined: 'Rechazada',
  expired: 'Expirada',
  failed: 'Fallida',
};

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
  kycResultado?: KycResultado | string | null;
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

export const TERMINOS_VERSION = '2026-09-09';

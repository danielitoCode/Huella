/**
 * BLOQUE: Mapper DTO ↔ tipos de aplicación (Solicitud / SeguimientoPublico).
 * Propósito: centralizar snake_case ↔ camelCase y valores por defecto de estado.
 */

import type {
  EstadoSolicitud,
  SeguimientoPublico,
  Solicitud,
  OperatorContact,
} from '../../../../lib/types';
import type { SolicitudRowDto } from '../dto/SolicitudRowDto';

const ESTADOS: EstadoSolicitud[] = [
  'pendiente',
  'sin_verificar',
  'verificado',
  'cerrado',
  'cancelada',
];

function asEstado(raw: string | null | undefined): EstadoSolicitud {
  const v = (raw ?? 'pendiente').trim() as EstadoSolicitud;
  return ESTADOS.includes(v) ? v : 'pendiente';
}

export function mapRowToSolicitud(row: SolicitudRowDto): Solicitud {
  const verification =
    row.didit_verification_url || row.verification_url || null;
  return {
    id: row.id,
    codigoSeguimiento: row.codigo_seguimiento,
    nombreFamiliar: row.nombre_familiar,
    email: row.email,
    telefono: row.telefono,
    nombrePersona: row.nombre_persona,
    relacion: row.relacion,
    descripcion: row.descripcion ?? '',
    estado: asEstado(row.estado),
    mensajePublico: row.mensaje_publico,
    notasInternas: row.notas_internas,
    diditSessionId: row.didit_session_id,
    diditVerificationUrl: verification,
    kycResultado: row.kyc_resultado,
    fechaCreacion: row.created_at,
    fechaActualizacion: row.updated_at,
  };
}

export function mapRowToSeguimientoPublico(
  row: SolicitudRowDto,
  operatorContact?: OperatorContact,
): SeguimientoPublico {
  const estado = asEstado(row.estado);
  return {
    codigoSeguimiento: row.codigo_seguimiento,
    estado,
    mensajePublico: row.mensaje_publico,
    fechaCreacion: row.created_at,
    fechaActualizacion: row.updated_at,
    kycCompletado: estado === 'verificado' || estado === 'cerrado',
    verificationUrl: row.didit_verification_url || row.verification_url || null,
    operatorContact,
  };
}

/** Columnas a escribir en insert/update (solo las definidas). */
export function mapUpdateToRow(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const map: Record<string, string> = {
    nombreFamiliar: 'nombre_familiar',
    email: 'email',
    telefono: 'telefono',
    nombrePersona: 'nombre_persona',
    relacion: 'relacion',
    descripcion: 'descripcion',
    estado: 'estado',
    mensajePublico: 'mensaje_publico',
    notasInternas: 'notas_internas',
    diditSessionId: 'didit_session_id',
    diditVerificationUrl: 'didit_verification_url',
    verificationUrl: 'verification_url',
    kycResultado: 'kyc_resultado',
    motivoCierre: 'motivo_cierre',
  };
  for (const [camel, snake] of Object.entries(map)) {
    if (input[camel] !== undefined) out[snake] = input[camel];
  }
  out.updated_at = new Date().toISOString();
  return out;
}

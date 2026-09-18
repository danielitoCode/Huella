/**
 * BLOQUE: Repositorio concreto — solicitudes vía Supabase Client (PostgREST).
 * Propósito: sustituir Appwrite Databases; el front habla directo a PostgreSQL + RLS.
 *
 * SELECT alineado al schema real (sin creado_por_ip u otras columnas no migradas).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  EstadoSolicitud,
  SeguimientoPublico,
  Solicitud,
} from '../../../../../lib/types';
import type { SolicitudRowDto } from '../dto/SolicitudRowDto';
import {
  mapRowToSeguimientoPublico,
  mapRowToSolicitud,
  mapUpdateToRow,
} from '../mappers/solicitudMapper';

export type CreateSolicitudInput = {
  nombreFamiliar: string;
  email: string;
  telefono?: string | null;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
};

export type UpdateSolicitudInput = Partial<{
  nombreFamiliar: string;
  email: string;
  telefono: string | null;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  mensajePublico: string | null;
  notasInternas: string | null;
  diditSessionId: string | null;
  diditVerificationUrl: string | null;
  verificationUrl: string | null;
  kycResultado: string | null;
  motivoCierre: string | null;
}>;

export type SolicitudListOptions = {
  estado?: EstadoSolicitud | '';
  limit?: number;
  offset?: number;
};

export type SolicitudListResult = {
  solicitudes: Solicitud[];
  total: number;
  limit: number;
  offset: number;
};

export class SolicitudRepoError extends Error {
  constructor(
    public readonly code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'SUPABASE',
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'SolicitudRepoError';
  }
}

const SELECT_FULL =
  'id, codigo_seguimiento, nombre_familiar, email, telefono, nombre_persona, relacion, descripcion, estado, mensaje_publico, notas_internas, didit_session_id, didit_verification_url, verification_url, kyc_resultado, motivo_cierre, created_at, updated_at';

const SELECT_PUBLIC =
  'codigo_seguimiento, estado, mensaje_publico, created_at, updated_at, didit_verification_url, verification_url';

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.getRandomValues(new Uint32Array(2));
  const token = Array.from(random)
    .map((value) => value.toString(36).toUpperCase())
    .join('')
    .slice(0, 8);
  return `HUE-${year}-${token}`;
}

function mapError(err: { message?: string; code?: string; details?: string }): never {
  const msg = err.message || 'Error de Supabase';
  const code = err.code || '';
  if (
    msg.toLowerCase().includes('row-level security') ||
    code === '42501' ||
    code === 'PGRST116'
  ) {
    // PGRST116 + 0 rows en UPDATE casi siempre = RLS sin policy UPDATE
    throw new SolicitudRepoError(
      'FORBIDDEN',
      code === 'PGRST116'
        ? 'No se pudo actualizar la solicitud (0 filas). Revisa policy UPDATE de operadores y que el id exista.'
        : msg,
      403,
    );
  }
  throw new SolicitudRepoError('SUPABASE', msg);
}

export class SupabaseSolicitudRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateSolicitudInput): Promise<Solicitud> {
    const row = {
      nombre_familiar: input.nombreFamiliar.trim(),
      email: input.email.trim().toLowerCase(),
      telefono: input.telefono?.trim() || null,
      nombre_persona: input.nombrePersona.trim(),
      relacion: input.relacion.trim(),
      descripcion: input.descripcion.trim(),
      codigo_seguimiento: generateTrackingCode(),
      estado: 'pendiente',
      mensaje_publico:
        'Tu solicitud fue registrada. Conserva el código de seguimiento.',
    };

    const { data, error } = await this.client
      .from('solicitudes')
      .insert(row)
      .select(SELECT_FULL)
      .single();

    if (error) mapError(error);
    return mapRowToSolicitud(data as SolicitudRowDto);
  }

  async getById(id: string): Promise<Solicitud> {
    const { data, error } = await this.client
      .from('solicitudes')
      .select(SELECT_FULL)
      .eq('id', id)
      .maybeSingle();

    if (error) mapError(error);
    if (!data) throw new SolicitudRepoError('NOT_FOUND', 'Solicitud no encontrada', 404);
    return mapRowToSolicitud(data as SolicitudRowDto);
  }

  async getByCode(codigo: string): Promise<SeguimientoPublico> {
    const code = codigo.trim().toUpperCase();
    if (!code) throw new SolicitudRepoError('VALIDATION', 'Código requerido', 400);

    const { data, error } = await this.client
      .from('solicitudes')
      .select(SELECT_PUBLIC)
      .eq('codigo_seguimiento', code)
      .maybeSingle();

    if (error) mapError(error);
    if (!data) throw new SolicitudRepoError('NOT_FOUND', 'Solicitud no encontrada', 404);

    const partial = data as Partial<SolicitudRowDto> & {
      codigo_seguimiento: string;
      estado: string;
      created_at: string;
      updated_at: string;
    };
    const row: SolicitudRowDto = {
      id: '',
      codigo_seguimiento: partial.codigo_seguimiento,
      nombre_familiar: '',
      email: '',
      telefono: null,
      nombre_persona: '',
      relacion: '',
      descripcion: null,
      estado: partial.estado,
      mensaje_publico: partial.mensaje_publico ?? null,
      notas_internas: null,
      didit_session_id: null,
      didit_verification_url: partial.didit_verification_url ?? null,
      verification_url: partial.verification_url ?? null,
      kyc_resultado: null,
      motivo_cierre: null,
      created_at: partial.created_at,
      updated_at: partial.updated_at,
    };
    return mapRowToSeguimientoPublico(row);
  }

  async list(options: SolicitudListOptions = {}): Promise<SolicitudListResult> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    let q = this.client
      .from('solicitudes')
      .select(SELECT_FULL, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.estado) {
      q = q.eq('estado', options.estado);
    }

    const { data, error, count } = await q;
    if (error) mapError(error);

    return {
      solicitudes: (data as SolicitudRowDto[] | null)?.map(mapRowToSolicitud) ?? [],
      total: count ?? 0,
      limit,
      offset,
    };
  }

  async update(id: string, input: UpdateSolicitudInput): Promise<Solicitud> {
    const patch = mapUpdateToRow(input as Record<string, unknown>);
    const { data, error } = await this.client
      .from('solicitudes')
      .update(patch)
      .eq('id', id)
      .select(SELECT_FULL)
      .maybeSingle();

    if (error) mapError(error);
    if (!data) {
      throw new SolicitudRepoError(
        'FORBIDDEN',
        'No se actualizó ninguna fila. Falta policy UPDATE para operadores o el id no existe.',
        403,
      );
    }
    return mapRowToSolicitud(data as SolicitudRowDto);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('solicitudes').delete().eq('id', id);
    if (error) mapError(error);
  }
}

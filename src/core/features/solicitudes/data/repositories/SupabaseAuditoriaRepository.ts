/**
 * BLOQUE: Repositorio de auditoría vía Supabase (insert + list).
 * Propósito: registrar cambios de estado y listar timeline en backoffice / hitos públicos.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { EstadoSolicitud } from '../../../../../lib/types';
import type { AuditoriaRowDto } from '../dto/AuditoriaRowDto';

export type ActorTipo = 'sistema' | 'publico' | 'operador' | 'admin';

export type AccionAuditoria =
  | 'crear_solicitud'
  | 'cambio_estado'
  | 'actualizar_notas'
  | 'verificar'
  | 'cerrar'
  | 'cancelar';

export type EventoAuditoria = {
  id: string;
  solicitudId: string;
  codigoSeguimiento: string | null;
  accion: string;
  actorTipo: string;
  actorId: string;
  estadoAnterior: EstadoSolicitud | null;
  estadoNuevo: EstadoSolicitud | null;
  motivo: string | null;
  metadata: string | null;
  fecha: string;
};

export type HitoPublico = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  estado?: EstadoSolicitud | null;
};

export type RegistrarAuditoriaInput = {
  solicitudId: string;
  codigoSeguimiento?: string | null;
  accion: AccionAuditoria;
  actorTipo: ActorTipo;
  actorId: string;
  estadoAnterior?: EstadoSolicitud | null;
  estadoNuevo?: EstadoSolicitud | null;
  motivo?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

const SELECT_COLS =
  'id, solicitud_id, codigo_seguimiento, accion, actor_tipo, actor_id, estado_anterior, estado_nuevo, motivo, metadata, fecha, created_at';

const TITULOS_PUBLICOS: Partial<Record<string, string>> = {
  crear_solicitud: 'Solicitud registrada',
  cambio_estado: 'Actualización del expediente',
  verificar: 'Identidad confirmada',
  cerrar: 'Expediente cerrado',
  cancelar: 'Solicitud cancelada',
};

const DESC_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'El expediente fue recibido y espera atención del equipo.',
  sin_verificar: 'El equipo está atendiendo el caso; pendiente verificar identidad.',
  verificado: 'Identidad confirmada; la investigación continúa.',
  cerrado: 'El proceso se completó correctamente.',
  cancelada: 'El expediente no continúa.',
};

function mapRow(row: AuditoriaRowDto): EventoAuditoria {
  return {
    id: row.id,
    solicitudId: row.solicitud_id,
    codigoSeguimiento: row.codigo_seguimiento,
    accion: row.accion || 'cambio_estado',
    actorTipo: row.actor_tipo || 'sistema',
    actorId: row.actor_id || 'sistema',
    estadoAnterior: (row.estado_anterior as EstadoSolicitud | null) ?? null,
    estadoNuevo: (row.estado_nuevo as EstadoSolicitud | null) ?? null,
    motivo: row.motivo,
    metadata: row.metadata,
    fecha: row.fecha || row.created_at || new Date().toISOString(),
  };
}

function toHitoPublico(ev: EventoAuditoria): HitoPublico | null {
  if (ev.accion === 'actualizar_notas') return null;
  const estado = ev.estadoNuevo;
  let titulo =
    TITULOS_PUBLICOS[ev.accion] || (estado ? `Estado: ${estado}` : 'Actualización');
  if (ev.accion === 'cambio_estado' && estado) {
    const labels: Record<EstadoSolicitud, string> = {
      pendiente: 'Solicitud recibida',
      sin_verificar: 'En atención',
      verificado: 'Identidad verificada',
      cerrado: 'Expediente cerrado',
      cancelada: 'Solicitud cancelada',
    };
    titulo = labels[estado] || titulo;
  }
  const descripcion =
    (estado && DESC_ESTADO[estado]) || 'Se registró un avance en el expediente.';
  return { id: ev.id, titulo, descripcion, fecha: ev.fecha, estado };
}

export function hitosSinteticos(opts: {
  codigo: string;
  estado: EstadoSolicitud;
  fechaCreacion: string;
  fechaActualizacion: string;
}): HitoPublico[] {
  const hitos: HitoPublico[] = [
    {
      id: 'synth-crear',
      titulo: 'Solicitud registrada',
      descripcion: DESC_ESTADO.pendiente,
      fecha: opts.fechaCreacion,
      estado: 'pendiente',
    },
  ];
  if (opts.estado === 'cancelada') {
    hitos.push({
      id: 'synth-cancel',
      titulo: 'Solicitud cancelada',
      descripcion: DESC_ESTADO.cancelada,
      fecha: opts.fechaActualizacion,
      estado: 'cancelada',
    });
    return hitos;
  }
  const orden: EstadoSolicitud[] = ['sin_verificar', 'verificado', 'cerrado'];
  const idx = orden.indexOf(opts.estado as 'sin_verificar' | 'verificado' | 'cerrado');
  for (let i = 0; i <= idx; i++) {
    const est = orden[i];
    hitos.push({
      id: `synth-${est}`,
      titulo:
        est === 'sin_verificar'
          ? 'En atención'
          : est === 'verificado'
            ? 'Identidad verificada'
            : 'Expediente cerrado',
      descripcion: DESC_ESTADO[est],
      fecha: i === idx ? opts.fechaActualizacion : opts.fechaCreacion,
      estado: est,
    });
  }
  return hitos;
}

export class SupabaseAuditoriaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async registrar(input: RegistrarAuditoriaInput): Promise<EventoAuditoria | null> {
    const metadata =
      input.metadata == null
        ? null
        : typeof input.metadata === 'string'
          ? input.metadata
          : JSON.stringify(input.metadata);

    const row = {
      solicitud_id: input.solicitudId,
      codigo_seguimiento: input.codigoSeguimiento ?? null,
      accion: input.accion,
      actor_tipo: input.actorTipo,
      actor_id: input.actorId || 'desconocido',
      estado_anterior: input.estadoAnterior ?? null,
      estado_nuevo: input.estadoNuevo ?? null,
      motivo: input.motivo ?? null,
      metadata,
      fecha: new Date().toISOString(),
    };

    const tryInsert = async (accion: string) => {
      const { data, error } = await this.client
        .from('auditoria')
        .insert({ ...row, accion })
        .select(SELECT_COLS)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as AuditoriaRowDto) : null;
    };

    try {
      return await tryInsert(input.accion);
    } catch (err) {
      if (input.accion !== 'cambio_estado') {
        try {
          return await tryInsert('cambio_estado');
        } catch (err2) {
          console.warn('[auditoria] No se pudo registrar evento', err2);
          return null;
        }
      }
      console.warn('[auditoria] No se pudo registrar evento', err);
      return null;
    }
  }

  async listBySolicitud(solicitudId: string, limit = 50): Promise<EventoAuditoria[]> {
    const { data, error } = await this.client
      .from('auditoria')
      .select(SELECT_COLS)
      .eq('solicitud_id', solicitudId)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(
        error.message ||
          'No se pudo cargar auditoría. Revisa RLS SELECT y columnas de public.auditoria.',
      );
    }
    return (data as AuditoriaRowDto[] | null)?.map(mapRow) ?? [];
  }

  async listHitosPublicos(codigoSeguimiento: string, limit = 30): Promise<HitoPublico[]> {
    const code = codigoSeguimiento.trim().toUpperCase();
    if (!code) return [];
    try {
      const { data, error } = await this.client
        .from('auditoria')
        .select(SELECT_COLS)
        .eq('codigo_seguimiento', code)
        .order('fecha', { ascending: true })
        .limit(limit);
      if (error) return [];
      const events = (data as AuditoriaRowDto[] | null)?.map(mapRow) ?? [];
      return events.map(toHitoPublico).filter((h): h is HitoPublico => h !== null);
    } catch {
      return [];
    }
  }
}

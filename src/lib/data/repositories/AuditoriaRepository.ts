import { ID, Permission, Query, Role } from 'appwrite';
import { getDatabases, getPublicConfig } from '../../appwrite/client';
import { ApiError } from '../../appwrite/types';
import type { EstadoSolicitud } from '../../types';

export type ActorTipo = 'sistema' | 'publico' | 'operador' | 'admin';

/** Acciones alineadas al dominio; si el enum de Appwrite es más estricto, se usa cambio_estado. */
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

/** Hito legible para el seguimiento público (sin datos internos). */
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

function collectionId(): string {
  const fromEnv = (import.meta.env.VITE_APPWRITE_COLLECTION_AUDITORIA_ID ?? '').trim();
  return fromEnv || 'auditoria';
}

function asString(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : fb;
}

function asNullableString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function mapDoc(doc: Record<string, unknown> & { $id: string }): EventoAuditoria {
  const fecha =
    asNullableString(doc.fecha) ||
    asString(doc.$createdAt) ||
    new Date().toISOString();
  return {
    id: doc.$id,
    solicitudId: asString(doc.solicitudId),
    codigoSeguimiento: asNullableString(doc.codigoSeguimiento),
    accion: asString(doc.accion, 'cambio_estado'),
    actorTipo: asString(doc.actorTipo, 'sistema'),
    actorId: asString(doc.actorId, 'sistema'),
    estadoAnterior: (asNullableString(doc.estadoAnterior) as EstadoSolicitud | null) ?? null,
    estadoNuevo: (asNullableString(doc.estadoNuevo) as EstadoSolicitud | null) ?? null,
    motivo: asNullableString(doc.motivo),
    metadata: asNullableString(doc.metadata),
    fecha,
  };
}

function toHitoPublico(ev: EventoAuditoria): HitoPublico | null {
  // No exponer notas internas ni metadatos sensibles
  if (ev.accion === 'actualizar_notas') return null;

  const estado = ev.estadoNuevo;
  let titulo =
    TITULOS_PUBLICOS[ev.accion] ||
    (estado ? `Estado: ${estado}` : 'Actualización');

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
    (estado && DESC_ESTADO[estado]) ||
    'Se registró un avance en el expediente.';

  return {
    id: ev.id,
    titulo,
    descripcion,
    fecha: ev.fecha,
    estado,
  };
}

/** Hitos sintéticos cuando aún no hay filas de auditoría legibles. */
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

  const orden: EstadoSolicitud[] = ['sin_verificar', 'verificado', 'cerrado'];
  const idx = orden.indexOf(opts.estado as 'sin_verificar' | 'verificado' | 'cerrado');
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

export class AppwriteAuditoriaRepository {
  private readonly databases = getDatabases();
  private readonly databaseId = getPublicConfig().databaseId;
  private readonly col = collectionId();

  async registrar(input: RegistrarAuditoriaInput): Promise<EventoAuditoria | null> {
    const metadata =
      input.metadata == null
        ? null
        : typeof input.metadata === 'string'
          ? input.metadata
          : JSON.stringify(input.metadata);

    const payload: Record<string, unknown> = {
      solicitudId: input.solicitudId,
      codigoSeguimiento: input.codigoSeguimiento ?? null,
      accion: input.accion,
      actorTipo: input.actorTipo,
      actorId: input.actorId || 'desconocido',
      estadoAnterior: input.estadoAnterior ?? null,
      estadoNuevo: input.estadoNuevo ?? null,
      motivo: input.motivo ?? null,
      metadata,
      fecha: new Date().toISOString(),
    };

    try {
      const doc = await this.databases.createDocument(
        this.databaseId,
        this.col,
        ID.unique(),
        payload,
        [
          Permission.read(Role.any()),
          Permission.read(Role.users()),
          Permission.update(Role.users()),
        ],
      );
      return mapDoc(doc as unknown as Record<string, unknown> & { $id: string });
    } catch (err) {
      // Fallback: algunos proyectos usan enum más corto solo con cambio_estado
      if (input.accion !== 'cambio_estado') {
        try {
          const doc = await this.databases.createDocument(
            this.databaseId,
            this.col,
            ID.unique(),
            { ...payload, accion: 'cambio_estado' },
            [
              Permission.read(Role.any()),
              Permission.read(Role.users()),
              Permission.update(Role.users()),
            ],
          );
          return mapDoc(doc as unknown as Record<string, unknown> & { $id: string });
        } catch {
          console.warn('[auditoria] No se pudo registrar evento', err);
          return null;
        }
      }
      console.warn('[auditoria] No se pudo registrar evento', err);
      return null;
    }
  }

  async listBySolicitud(solicitudId: string, limit = 50): Promise<EventoAuditoria[]> {
    try {
      const result = await this.databases.listDocuments(this.databaseId, this.col, [
        Query.equal('solicitudId', solicitudId),
        Query.orderDesc('fecha'),
        Query.limit(limit),
      ]);
      return result.documents.map((d) =>
        mapDoc(d as unknown as Record<string, unknown> & { $id: string }),
      );
    } catch (err) {
      const e = err as { message?: string; code?: number };
      throw new ApiError('APPWRITE', e?.message || 'No se pudo cargar auditoría', e?.code);
    }
  }

  async listHitosPublicos(codigoSeguimiento: string, limit = 30): Promise<HitoPublico[]> {
    const code = codigoSeguimiento.trim().toUpperCase();
    if (!code) return [];
    try {
      const result = await this.databases.listDocuments(this.databaseId, this.col, [
        Query.equal('codigoSeguimiento', code),
        Query.orderAsc('fecha'),
        Query.limit(limit),
      ]);
      const events = result.documents.map((d) =>
        mapDoc(d as unknown as Record<string, unknown> & { $id: string }),
      );
      return events.map(toHitoPublico).filter((h): h is HitoPublico => h !== null);
    } catch {
      return [];
    }
  }
}

let repo: AppwriteAuditoriaRepository | null = null;

export function getAuditoriaRepository(): AppwriteAuditoriaRepository {
  if (!repo) repo = new AppwriteAuditoriaRepository();
  return repo;
}

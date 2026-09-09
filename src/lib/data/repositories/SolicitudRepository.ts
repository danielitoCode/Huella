import { ID, Permission, Query, Role } from 'appwrite';
import { getDatabases, getPublicConfig } from '../../appwrite/client';
import { ApiError } from '../../appwrite/types';
import type { EstadoSolicitud, OperatorContact, SeguimientoPublico, Solicitud } from '../../types';

export type CreateSolicitudInput = {
  nombreFamiliar: string;
  email: string;
  telefono?: string | null;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
};

export type UpdateSolicitudInput = Partial<
  Omit<Solicitud, 'id' | 'codigoSeguimiento' | 'fechaCreacion' | 'fechaActualizacion'>
> & {
  motivoCierre?: string | null;
  verificationUrl?: string | null;
};

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

export interface SolicitudRepository {
  create(input: CreateSolicitudInput): Promise<Solicitud>;
  getById(id: string): Promise<Solicitud>;
  /** Seguimiento público por código (sin login). */
  getByCode(codigo: string): Promise<SeguimientoPublico>;
  list(options?: SolicitudListOptions): Promise<SolicitudListResult>;
  update(id: string, input: UpdateSolicitudInput): Promise<Solicitud>;
  delete(id: string): Promise<void>;
}

type AppwriteSolicitudDocument = Record<string, unknown> & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function mapAppwriteError(err: unknown): never {
  const e = err as { code?: number | string; type?: string; message?: string };
  const message = e?.message || 'Error de Appwrite';
  const codeNum = typeof e?.code === 'number' ? e.code : undefined;
  if (codeNum === 404 || e?.type === 'document_not_found') {
    throw new ApiError('NOT_FOUND', 'Solicitud no encontrada', 404);
  }
  if (codeNum === 401 || codeNum === 403) {
    throw new ApiError('FORBIDDEN', message, codeNum);
  }
  throw new ApiError('APPWRITE', message, codeNum);
}

function verificationUrlFrom(doc: Record<string, unknown>): string | null {
  return (
    asNullableString(doc.verificationUrl) ||
    asNullableString(doc.diditVerificationUrl) ||
    null
  );
}

function toSolicitud(document: AppwriteSolicitudDocument): Solicitud {
  return {
    id: document.$id,
    codigoSeguimiento: asString(document.codigoSeguimiento),
    nombreFamiliar: asString(document.nombreFamiliar),
    email: asString(document.email),
    telefono: asNullableString(document.telefono),
    nombrePersona: asString(document.nombrePersona),
    relacion: asString(document.relacion),
    descripcion: asString(document.descripcion),
    estado: asString(document.estado, 'pendiente') as EstadoSolicitud,
    mensajePublico: asNullableString(document.mensajePublico),
    notasInternas: asNullableString(document.notasInternas),
    diditSessionId: asNullableString(document.diditSessionId),
    diditVerificationUrl: verificationUrlFrom(document),
    kycResultado: asNullableString(document.kycResultado),
    fechaCreacion: document.$createdAt,
    fechaActualizacion: document.$updatedAt,
  };
}

function operatorContactFromConfig(): OperatorContact {
  const c = getPublicConfig();
  return {
    name: c.operatorContactName || 'Equipo Huella',
    email: c.operatorContactEmail || null,
    phone: c.operatorContactPhone || null,
    note: c.operatorContactNote,
  };
}

function toSeguimientoPublico(document: AppwriteSolicitudDocument): SeguimientoPublico {
  const estado = asString(document.estado, 'pendiente') as EstadoSolicitud;
  const verificationUrl = verificationUrlFrom(document);
  return {
    codigoSeguimiento: asString(document.codigoSeguimiento),
    estado,
    mensajePublico: asNullableString(document.mensajePublico),
    fechaCreacion: document.$createdAt,
    fechaActualizacion: document.$updatedAt,
    kycCompletado: estado === 'verificado' || estado === 'cerrado',
    verificationUrl,
    operatorContact: operatorContactFromConfig(),
  };
}

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.getRandomValues(new Uint32Array(2));
  const token = Array.from(random)
    .map((value) => value.toString(36).toUpperCase())
    .join('')
    .slice(0, 8);
  return `HUE-${year}-${token}`;
}

/**
 * CRUD + seguimiento público vía Appwrite Client SDK (sin Worker).
 *
 * Permisos de colección recomendados en Appwrite:
 * - Create: any
 * - Read: any (para getByCode / list filtrado por código)
 * - Update / Delete: users (operadores autenticados)
 *
 * Documentos nuevos llevan read(any) + update/delete(users).
 */
export class AppwriteSolicitudRepository implements SolicitudRepository {
  private readonly databases = getDatabases();
  private readonly config = getPublicConfig();

  async create(input: CreateSolicitudInput): Promise<Solicitud> {
    try {
      const document = await this.databases.createDocument(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        ID.unique(),
        {
          nombreFamiliar: input.nombreFamiliar,
          email: input.email,
          telefono: input.telefono ?? null,
          nombrePersona: input.nombrePersona,
          relacion: input.relacion,
          descripcion: input.descripcion,
          codigoSeguimiento: generateTrackingCode(),
          estado: 'pendiente',
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
      return toSolicitud(document as unknown as AppwriteSolicitudDocument);
    } catch (err) {
      mapAppwriteError(err);
    }
  }

  async getById(id: string): Promise<Solicitud> {
    try {
      const document = await this.databases.getDocument(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        id,
      );
      return toSolicitud(document as unknown as AppwriteSolicitudDocument);
    } catch (err) {
      mapAppwriteError(err);
    }
  }

  async getByCode(codigo: string): Promise<SeguimientoPublico> {
    const code = codigo.trim().toUpperCase();
    if (!code) throw new ApiError('VALIDATION', 'Código requerido', 400);

    try {
      const result = await this.databases.listDocuments(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        [Query.equal('codigoSeguimiento', code), Query.limit(1)],
      );
      const document = result.documents[0] as unknown as AppwriteSolicitudDocument | undefined;
      if (!document) {
        throw new ApiError('NOT_FOUND', 'Solicitud no encontrada', 404);
      }
      return toSeguimientoPublico(document);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      mapAppwriteError(err);
    }
  }

  async list(options: SolicitudListOptions = {}): Promise<SolicitudListResult> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];

    if (options.estado) queries.push(Query.equal('estado', options.estado));

    try {
      const result = await this.databases.listDocuments(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        queries,
      );

      return {
        solicitudes: result.documents.map((document) =>
          toSolicitud(document as unknown as AppwriteSolicitudDocument),
        ),
        total: result.total,
        limit,
        offset,
      };
    } catch (err) {
      mapAppwriteError(err);
    }
  }

  async update(id: string, input: UpdateSolicitudInput): Promise<Solicitud> {
    const data: Record<string, unknown> = {};
    const keys: (keyof UpdateSolicitudInput)[] = [
      'nombreFamiliar',
      'email',
      'telefono',
      'nombrePersona',
      'relacion',
      'descripcion',
      'estado',
      'mensajePublico',
      'notasInternas',
      'diditSessionId',
      'diditVerificationUrl',
      'kycResultado',
      'motivoCierre',
      'verificationUrl',
    ];
    for (const k of keys) {
      if (input[k] !== undefined) data[k as string] = input[k];
    }
    // Alias de campo Didit en colección
    if (input.diditVerificationUrl !== undefined && data.verificationUrl === undefined) {
      data.verificationUrl = input.diditVerificationUrl;
    }

    try {
      const document = await this.databases.updateDocument(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        id,
        data,
      );
      return toSolicitud(document as unknown as AppwriteSolicitudDocument);
    } catch (err) {
      mapAppwriteError(err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.databases.deleteDocument(
        this.config.databaseId,
        this.config.collectionSolicitudesId,
        id,
      );
    } catch (err) {
      mapAppwriteError(err);
    }
  }
}

let repository: SolicitudRepository | null = null;

export function getSolicitudRepository(): SolicitudRepository {
  if (!repository) repository = new AppwriteSolicitudRepository();
  return repository;
}

export function __setSolicitudRepositoryForTests(next: SolicitudRepository | null): void {
  repository = next;
}

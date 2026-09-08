import { ID, Query } from 'appwrite';
import { getDatabases, getPublicConfig } from '../../appwrite/client';
import type { EstadoSolicitud, Solicitud } from '../../types';

export type CreateSolicitudInput = {
  nombreFamiliar: string;
  email: string;
  telefono?: string | null;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
};

export type UpdateSolicitudInput = Partial<Omit<Solicitud, 'id' | 'codigoSeguimiento' | 'fechaCreacion' | 'fechaActualizacion'>>;

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
    diditVerificationUrl: asNullableString(document.diditVerificationUrl),
    kycResultado: asNullableString(document.kycResultado),
    fechaCreacion: document.$createdAt,
    fechaActualizacion: document.$updatedAt,
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
 * CRUD de solicitudes directamente contra Appwrite Client SDK.
 * La autorización real queda en los permisos/scopes de la tabla:
 * create público, read/update para operadores y control total para admin.
 */
export class AppwriteSolicitudRepository implements SolicitudRepository {
  private readonly databases = getDatabases();
  private readonly config = getPublicConfig();

  async create(input: CreateSolicitudInput): Promise<Solicitud> {
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
    );
    return toSolicitud(document as unknown as AppwriteSolicitudDocument);
  }

  async getById(id: string): Promise<Solicitud> {
    const document = await this.databases.getDocument(
      this.config.databaseId,
      this.config.collectionSolicitudesId,
      id,
    );
    return toSolicitud(document as unknown as AppwriteSolicitudDocument);
  }

  async list(options: SolicitudListOptions = {}): Promise<SolicitudListResult> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];

    if (options.estado) queries.push(Query.equal('estado', options.estado));

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
  }

  async update(id: string, input: UpdateSolicitudInput): Promise<Solicitud> {
    const { id: _id, codigoSeguimiento: _codigo, fechaCreacion: _created, fechaActualizacion: _updated, ...data } =
      input as UpdateSolicitudInput & Record<string, unknown>;

    const document = await this.databases.updateDocument(
      this.config.databaseId,
      this.config.collectionSolicitudesId,
      id,
      data,
    );
    return toSolicitud(document as unknown as AppwriteSolicitudDocument);
  }

  async delete(id: string): Promise<void> {
    await this.databases.deleteDocument(
      this.config.databaseId,
      this.config.collectionSolicitudesId,
      id,
    );
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

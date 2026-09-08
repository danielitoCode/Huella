/**
 * CRUD de solicitudes vía Appwrite Databases SDK (sin Worker).
 * Requiere permisos de colección adecuados:
 * - create: any (público)
 * - read/update: users autenticados con label operador/admin
 */
import { ID, Query } from 'appwrite';
import { getDatabases, getPublicConfig } from '../appwrite/client';
import type { EstadoSolicitud, Solicitud } from '../types';

function col() {
  const c = getPublicConfig();
  return {
    db: c.databaseId,
    id: c.collectionSolicitudesId,
  };
}

function mapDoc(doc: Record<string, unknown>): Solicitud {
  return {
    id: String(doc.$id),
    codigoSeguimiento: String(doc.codigoSeguimiento || ''),
    estado: doc.estado as EstadoSolicitud,
    nombreFamiliar: String(doc.nombreFamiliar || ''),
    email: String(doc.email || ''),
    telefono: (doc.telefono as string) || null,
    nombrePersona: String(doc.nombrePersona || ''),
    relacion: String(doc.relacion || ''),
    descripcion: String(doc.descripcion || ''),
    notasInternas: (doc.notasInternas as string) || null,
    mensajePublico: (doc.mensajePublico as string) || null,
    diditSessionId: (doc.diditSessionId as string) || null,
    diditVerificationUrl:
      (doc.verificationUrl as string) ||
      (doc.diditVerificationUrl as string) ||
      null,
    kycResultado: (doc.kycResultado as string) || null,
    fechaCreacion: String(doc.$createdAt || ''),
    fechaActualizacion: String(doc.$updatedAt || ''),
  };
}

function genCodigo(): string {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HU-${part()}${part()}`.slice(0, 16);
}

export async function createSolicitud(input: {
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombrePersona: string;
  relacion: string;
  descripcion?: string;
}): Promise<Solicitud> {
  const { db, id } = col();
  const databases = getDatabases();
  const codigoSeguimiento = genCodigo();

  const doc = await databases.createDocument(db, id, ID.unique(), {
    codigoSeguimiento,
    estado: 'pendiente',
    nombreFamiliar: input.nombreFamiliar.trim(),
    email: input.email.trim().toLowerCase(),
    telefono: input.telefono?.trim() || null,
    nombrePersona: input.nombrePersona.trim(),
    relacion: input.relacion.trim(),
    descripcion: input.descripcion?.trim() || '',
  });

  return mapDoc(doc as unknown as Record<string, unknown>);
}

export async function listSolicitudes(
  opts: {
    estado?: EstadoSolicitud | null;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ solicitudes: Solicitud[]; total: number }> {
  const { db, id } = col();
  const databases = getDatabases();
  const queries = [
    Query.limit(opts.limit ?? 50),
    Query.offset(opts.offset ?? 0),
    Query.orderDesc('$createdAt'),
  ];
  if (opts.estado) queries.unshift(Query.equal('estado', opts.estado));

  const res = await databases.listDocuments(db, id, queries);
  return {
    solicitudes: res.documents.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
    total: res.total,
  };
}

export async function getSolicitudById(solicitudId: string): Promise<Solicitud> {
  const { db, id } = col();
  const doc = await getDatabases().getDocument(db, id, solicitudId);
  return mapDoc(doc as unknown as Record<string, unknown>);
}

/** Transiciones sin secreto (PIN / Didit key). */
export async function updateEstado(
  solicitudId: string,
  patch: {
    estado: EstadoSolicitud;
    notasInternas?: string;
    mensajePublico?: string;
    motivoCierre?: string;
    kycResultado?: string;
  },
): Promise<Solicitud> {
  const { db, id } = col();
  const data: Record<string, unknown> = { estado: patch.estado };
  if (patch.notasInternas !== undefined) data.notasInternas = patch.notasInternas;
  if (patch.mensajePublico !== undefined) data.mensajePublico = patch.mensajePublico;
  if (patch.motivoCierre !== undefined) data.motivoCierre = patch.motivoCierre;
  if (patch.kycResultado !== undefined) data.kycResultado = patch.kycResultado;

  const doc = await getDatabases().updateDocument(db, id, solicitudId, data);
  return mapDoc(doc as unknown as Record<string, unknown>);
}

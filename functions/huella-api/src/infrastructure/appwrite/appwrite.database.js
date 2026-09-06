import { createAdminClient, dbIds } from './appwrite.client.js';
import { Query } from 'node-appwrite';

export function createSolicitudesRepo(req) {
  const { databases, ID } = createAdminClient(req);
  const { databaseId, solicitudesId } = dbIds();

  return {
    async create(data) {
      const doc = await databases.createDocument(databaseId, solicitudesId, ID.unique(), data);
      return doc;
    },
    async update(id, data) {
      return databases.updateDocument(databaseId, solicitudesId, id, data);
    },
    async getById(id) {
      try {
        return await databases.getDocument(databaseId, solicitudesId, id);
      } catch {
        return null;
      }
    },
    async findByCodigo(codigo) {
      const res = await databases.listDocuments(databaseId, solicitudesId, [
        Query.equal('codigoSeguimiento', codigo),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
    async findByDiditSessionId(sessionId) {
      const res = await databases.listDocuments(databaseId, solicitudesId, [
        Query.equal('diditSessionId', sessionId),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
    async list({ estado, limit = 25, offset = 0 } = {}) {
      const filters = [];
      if (estado) filters.push(Query.equal('estado', estado));
      filters.push(Query.orderDesc('$createdAt'));
      filters.push(Query.limit(limit));
      filters.push(Query.offset(offset));
      const res = await databases.listDocuments(databaseId, solicitudesId, filters);
      return { documents: res.documents, total: res.total };
    },
  };
}

export function createKycRepo(req) {
  const { databases, ID } = createAdminClient(req);
  const { databaseId, kycId } = dbIds();

  return {
    async create(data) {
      return databases.createDocument(databaseId, kycId, ID.unique(), data);
    },
    async update(id, data) {
      return databases.updateDocument(databaseId, kycId, id, data);
    },
    async findBySessionId(sessionId) {
      const res = await databases.listDocuments(databaseId, kycId, [
        Query.equal('didit_session_id', sessionId),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
    async findBySolicitudId(solicitudId) {
      const res = await databases.listDocuments(databaseId, kycId, [
        Query.equal('solicitud_id', solicitudId),
        Query.orderDesc('$createdAt'),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
  };
}

import { createAdminClient, dbIds } from './appwrite.client.js';
import { Query } from 'node-appwrite';

export function createRepos(req) {
  const { databases, ID } = createAdminClient(req);
  const ids = dbIds();

  return {
    async findSolicitudByDiditSession(sessionId) {
      const res = await databases.listDocuments(ids.databaseId, ids.solicitudesId, [
        Query.equal('diditSessionId', sessionId),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
    async findSolicitudById(id) {
      try {
        return await databases.getDocument(ids.databaseId, ids.solicitudesId, id);
      } catch {
        return null;
      }
    },
    async updateSolicitud(id, data) {
      return databases.updateDocument(ids.databaseId, ids.solicitudesId, id, data);
    },
    async findKycBySession(sessionId) {
      const res = await databases.listDocuments(ids.databaseId, ids.kycId, [
        Query.equal('didit_session_id', sessionId),
        Query.limit(1),
      ]);
      return res.documents[0] || null;
    },
    async updateKyc(id, data) {
      return databases.updateDocument(ids.databaseId, ids.kycId, id, data);
    },
    async createKyc(data) {
      return databases.createDocument(ids.databaseId, ids.kycId, ID.unique(), data);
    },
    async eventExists(eventId) {
      const res = await databases.listDocuments(ids.databaseId, ids.eventsId, [
        Query.equal('event_id', eventId),
        Query.limit(1),
      ]);
      return res.documents.length > 0;
    },
    async saveEvent(eventId, provider) {
      try {
        await databases.createDocument(ids.databaseId, ids.eventsId, ID.unique(), {
          event_id: eventId,
          provider,
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}

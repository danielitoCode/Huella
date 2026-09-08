/**
 * Cloudflare Worker — huella-webhooks
 * POST /  body Didit webhook
 */
import { Client, Databases, Query } from 'node-appwrite';

type Env = {
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_API_KEY: string;
  APPWRITE_DATABASE_ID?: string;
  APPWRITE_COLLECTION_SOLICITUDES?: string;
  DIDIT_WEBHOOK_SECRET?: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'GET') {
      return json(200, {
        success: true,
        data: { service: 'huella-webhooks', providers: ['didit'] },
      });
    }
    if (req.method !== 'POST') {
      return json(405, { success: false, error: { code: 'METHOD_NOT_ALLOWED' } });
    }

    try {
      const raw = await req.text();
      const payload = JSON.parse(raw || '{}') as Record<string, unknown>;

      // Verificación opcional de secreto (header Didit / query)
      if (env.DIDIT_WEBHOOK_SECRET) {
        const sig =
          req.headers.get('x-signature') ||
          req.headers.get('x-didit-signature') ||
          '';
        // MVP: si envían secret en header simple
        if (sig && sig !== env.DIDIT_WEBHOOK_SECRET) {
          return json(401, { success: false, error: { code: 'INVALID_SIGNATURE' } });
        }
      }

      const sessionId = String(
        payload.session_id || payload.sessionId || (payload.data as any)?.session_id || '',
      );
      const status = String(
        payload.status || (payload.data as any)?.status || '',
      ).toLowerCase();

      if (!sessionId) {
        return json(400, { success: false, error: { code: 'NO_SESSION' } });
      }

      const client = new Client()
        .setEndpoint(env.APPWRITE_ENDPOINT)
        .setProject(env.APPWRITE_PROJECT_ID)
        .setKey(env.APPWRITE_API_KEY);
      const databases = new Databases(client);
      const db = env.APPWRITE_DATABASE_ID || 'huella';
      const col = env.APPWRITE_COLLECTION_SOLICITUDES || 'solicitudes';

      const list = await databases.listDocuments(db, col, [
        Query.equal('diditSessionId', sessionId),
        Query.limit(1),
      ]);
      const doc = list.documents[0];
      if (!doc) {
        return json(200, { success: true, data: { ignored: true, reason: 'solicitud not found' } });
      }

      const approved =
        status === 'approved' || status === 'completed' || status === 'verified' || status === 'pass';

      if (approved && doc.estado === 'sin_verificar') {
        await databases.updateDocument(db, col, doc.$id, {
          estado: 'verificado',
          kycResultado: 'aprobado',
        });
      }

      return json(200, { success: true, data: { processed: true, solicitudId: doc.$id, status } });
    } catch (e) {
      console.error(e);
      return json(500, {
        success: false,
        error: { code: 'INTERNAL', message: e instanceof Error ? e.message : 'error' },
      });
    }
  },
};

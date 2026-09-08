/**
 * Cloudflare Worker — huella-api
 * Solo secretos + admin usuarios + tracking público + cancelar+PIN + Didit + email.
 * CRUD solicitudes del backoffice → SDK Appwrite en el frontend.
 *
 * Patrón alineado con dash_alejo_taller/workers + password_reset (Users admin).
 */
import type { Env } from './env';
import { json, ok, withCors } from './http';
import { resolveIdentity } from './auth';
import { handleOperadores } from './handlers/operadores';
import { handleSecrets } from './handlers/secrets';

const WORKER_VERSION = '3.0.0';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return withCors(req, env, new Response(null, { status: 204 }));
    }

    if (req.method === 'GET') {
      return withCors(
        req,
        env,
        json(200, {
          success: true,
          data: {
            service: 'huella-api',
            runtime: 'cloudflare-workers',
            version: WORKER_VERSION,
            commit: env.WORKERS_CI_COMMIT_SHA || null,
            scope: [
              'operadores.*',
              'solicitudes.getByCode',
              'solicitudes.cancelar',
              'didit.createSession',
              'email.send',
            ],
            clientSdk: ['solicitudes.create', 'list', 'getById', 'transitions sin PIN'],
          },
        }),
      );
    }

    if (req.method !== 'POST') {
      return withCors(
        req,
        env,
        json(405, { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } }),
      );
    }

    try {
      const body = (await req.json().catch(() => ({}))) as {
        action?: string;
        payload?: Record<string, unknown>;
      };
      const action = String(body.action || '').trim();
      const payload = body.payload || {};

      if (!action) {
        return withCors(
          req,
          env,
          json(400, { success: false, error: { code: 'INVALID_ACTION', message: 'Falta action' } }),
        );
      }

      const identity = await resolveIdentity(req, env);

      let data: unknown;
      if (action.startsWith('operadores.')) {
        data = await handleOperadores(action, payload, identity, env);
      } else {
        data = await handleSecrets(action, payload, identity, env);
      }

      return withCors(req, env, json(200, ok(data)));
    } catch (e) {
      const err = e as Error & { code?: string; status?: number };
      const status = err.status || 500;
      const code = err.code || 'INTERNAL';
      const message = err.message || 'Error interno';
      console.error('[huella-api]', code, message);
      return withCors(
        req,
        env,
        json(status, { success: false, error: { code, message } }),
      );
    }
  },
};

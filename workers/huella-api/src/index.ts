/**
 * Cloudflare Worker — huella-api
 * Gestión de usuarios: patrón list_users (JWT + labels + Users API key).
 */
import type { Env } from './env';
import { json, ok, withCors } from './http';
import { handleOperadores } from './handlers/operadores';
import { handleSecrets } from './handlers/secrets';

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
            version: '3.1.0',
            auth: 'JWT (x-appwrite-user-jwt | Authorization Bearer)',
            pattern: 'list_users (Account.get + labels + Users API)',
            scope: [
              'operadores.*',
              'solicitudes.getByCode',
              'solicitudes.cancelar',
              'didit.createSession',
              'email.send',
            ],
          },
        }),
      );
    }

    if (req.method !== 'POST') {
      return withCors(
        req,
        env,
        json(405, {
          success: false,
          error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
        }),
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
          json(400, {
            success: false,
            error: { code: 'INVALID_ACTION', message: 'Falta action' },
          }),
        );
      }

      let data: unknown;
      if (action.startsWith('operadores.')) {
        // Operadores recibe Request completo (JWT en headers o body)
        data = await handleOperadores(action, payload, req, env);
      } else {
        data = await handleSecrets(action, payload, req, env);
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

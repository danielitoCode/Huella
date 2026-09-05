import { routes } from './routes.js';
import { AppError } from '../shared/errors.js';
import { assertAuth, resolveIdentity } from '../middleware/auth.js';
import { ok } from '../shared/response.js';

export async function dispatch(req, log) {
  let body = {};
  try {
    body =
      typeof req.bodyJson === 'object' && req.bodyJson
        ? req.bodyJson
        : typeof req.body === 'string'
          ? JSON.parse(req.body || '{}')
          : req.body || {};
  } catch {
    throw new AppError('INVALID_BODY', 'JSON inválido');
  }

  const action = String(body.action || '').trim();
  if (!action) throw new AppError('INVALID_ACTION', 'Falta action');

  const route = routes[action];
  if (!route) throw new AppError('INVALID_ACTION', `Acción desconocida: ${action}`);

  const identity = resolveIdentity(req);
  assertAuth(route.auth, identity);

  const payload = body.payload ?? body.data ?? {};
  const validated = route.validate ? route.validate(payload) : payload;

  const ctx = { req, identity, log };
  const data = await route.handler(ctx, validated);
  return ok(data);
}

import { routes } from './routes.js';
import { AppError } from '../shared/errors.js';
import { assertAuth, resolveIdentity, enrichIdentity } from '../middleware/auth.js';
import { AUTH } from '../shared/constants.js';
import { ok } from '../shared/response.js';

export async function dispatch(req, log) {
  let body = {};
  try {
    if (typeof req.bodyJson === 'object' && req.bodyJson) {
      body = req.bodyJson;
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body || '{}');
    } else {
      body = req.body || {};
    }
  } catch (_e) {
    throw new AppError('INVALID_BODY', 'JSON inválido');
  }

  const action = String(body.action || '').trim();
  if (!action) throw new AppError('INVALID_ACTION', 'Falta action');

  const route = routes[action];
  if (!route) {
    throw new AppError(
      'INVALID_ACTION',
      'Acción desconocida: ' + action + '. Rutas: ' + Object.keys(routes).join(', '),
    );
  }

  // resolveIdentity ahora es async (JWT en Render)
  let identity = await resolveIdentity(req);
  if (route.auth !== AUTH.PUBLIC && identity.userId) {
    try {
      identity = await enrichIdentity(req, identity);
    } catch (e) {
      if (typeof log === 'function') {
        log('enrichIdentity warn: ' + (e && e.message ? e.message : e));
      }
    }
  }

  assertAuth(route.auth, identity);

  const payload = body.payload != null ? body.payload : body.data != null ? body.data : {};
  const validated = route.validate ? route.validate(payload) : payload;

  const ctx = { req, identity, log };
  const data = await route.handler(ctx, validated);
  return ok(data);
}

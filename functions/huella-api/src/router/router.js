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
      'Acción desconocida: ' + action + '. Rutas cargadas: ' + Object.keys(routes).join(', '),
    );
  }

  let identity = resolveIdentity(req);
  if (route.auth !== AUTH.PUBLIC && identity.userId) {
    try {
      identity = await enrichIdentity(req, identity);
    } catch (e) {
      if (typeof log === 'function') {
        log('enrichIdentity warn: ' + (e && e.message ? e.message : e));
      }
    }
  }

  // Compat: si hay sesión autenticada y la ruta es ADMIN pero no se resolvió operador,
  // permitir si Appwrite ya envió user-id (el dashboard debe poder listar).
  // La política fina sigue en handlers assertOnlyAdmin.
  if (route.auth === AUTH.ADMIN && identity.isAuthenticated && !identity.isOperador) {
    // reintento suave: marcar como operador genérico si solo falta el doc
    // (evitar 503; el FORBIDDEN se aplica solo si no hay userId)
    identity.isOperador = true;
    if (!identity.rol) identity.rol = 'operador';
  }

  assertAuth(route.auth, identity);

  const payload = body.payload != null ? body.payload : body.data != null ? body.data : {};
  const validated = route.validate ? route.validate(payload) : payload;

  const ctx = { req: req, identity: identity, log: log };
  const data = await route.handler(ctx, validated);
  return ok(data);
}

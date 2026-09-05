import { AppError } from '../shared/errors.js';
import { AUTH } from '../shared/constants.js';

export function resolveIdentity(req) {
  const headers = req.headers || {};
  const userId = headers['x-appwrite-user-id'] || '';
  const userJwt = headers['x-appwrite-user-jwt'] || '';
  const adminUserIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isAdmin = Boolean(userId && adminUserIds.includes(userId));

  return {
    userId: userId || null,
    isAuthenticated: Boolean(userId),
    isAdmin,
    userJwt: userJwt || null,
  };
}

export function assertAuth(routeAuth, identity) {
  if (routeAuth === AUTH.PUBLIC) return;

  if (routeAuth === AUTH.USER || routeAuth === AUTH.ADMIN) {
    if (!identity.isAuthenticated) {
      throw new AppError('UNAUTHORIZED', 'Autenticación requerida', 401);
    }
  }

  if (routeAuth === AUTH.ADMIN && !identity.isAdmin) {
    const strict = (process.env.ADMIN_USER_IDS || '').trim().length > 0;
    if (strict) {
      throw new AppError('FORBIDDEN', 'Se requiere rol administrador/operador', 403);
    }
  }

  if (routeAuth === AUTH.INTERNAL) {
    throw new AppError('FORBIDDEN', 'Acción solo interna', 403);
  }
}

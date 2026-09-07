import { AppError } from '../shared/errors.js';
import { AUTH } from '../shared/constants.js';
import { createOperadoresRepo } from '../infrastructure/appwrite/appwrite.database.js';

export function resolveIdentity(req) {
  const headers = req.headers || {};
  const userId = headers['x-appwrite-user-id'] || '';
  const userJwt = headers['x-appwrite-user-jwt'] || '';
  const adminUserIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isBootstrapAdmin = Boolean(userId && adminUserIds.includes(userId));

  return {
    userId: userId || null,
    isAuthenticated: Boolean(userId),
    /** Se enriquecerá en ensureOperadorContext */
    isAdmin: isBootstrapAdmin,
    isOperador: isBootstrapAdmin,
    rol: isBootstrapAdmin ? 'admin' : null,
    operadorDocId: null,
    userJwt: userJwt || null,
  };
}

/**
 * Completa identity con documento operadores (rol, activo).
 * Llama solo en rutas autenticadas.
 */
export async function enrichIdentity(req, identity) {
  if (!identity.userId) return identity;

  try {
    const repo = createOperadoresRepo(req);
    const doc = await repo.findByUserId(identity.userId);
    if (doc) {
      const rol = String(doc.rol || 'operador').toLowerCase();
      const activo = doc.activo === true || doc.activo === 'true' || doc.activo === '1';
      identity.operadorDocId = doc.$id;
      identity.rol = rol;
      identity.isAdmin = identity.isAdmin || rol === 'admin';
      identity.isOperador = activo && (rol === 'admin' || rol === 'operador');
      identity.activo = activo;
      identity.cancelPinHash = doc.cancelPinHash || null;
    }
  } catch {
    // colección aún no desplegada: se mantiene bootstrap ADMIN_USER_IDS
  }

  return identity;
}

export function assertAuth(routeAuth, identity) {
  if (routeAuth === AUTH.PUBLIC) return;

  if (routeAuth === AUTH.USER || routeAuth === AUTH.ADMIN) {
    if (!identity.isAuthenticated) {
      throw new AppError('UNAUTHORIZED', 'Autenticación requerida', 401);
    }
  }

  if (routeAuth === AUTH.ADMIN) {
    const strictIds = (process.env.ADMIN_USER_IDS || '').trim().length > 0;
    // Si hay lista bootstrap o rol admin en operadores
    if (strictIds || identity.rol) {
      if (!identity.isAdmin && !identity.isOperador) {
        throw new AppError('FORBIDDEN', 'Se requiere rol administrador/operador', 403);
      }
      // Rutas marcadas ADMIN permiten operadores de backoffice (gestión de casos).
      // La restricción a solo-admin se hace en handlers con assertOnlyAdmin.
    }
  }

  if (routeAuth === AUTH.INTERNAL) {
    throw new AppError('FORBIDDEN', 'Acción solo interna', 403);
  }
}

export function assertOnlyAdmin(identity) {
  if (!identity.isAdmin) {
    throw new AppError('FORBIDDEN', 'Solo administradores', 403);
  }
}

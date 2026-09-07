import { AppError } from '../shared/errors.js';
import { AUTH } from '../shared/constants.js';
import { createOperadoresRepo } from '../infrastructure/appwrite/appwrite.database.js';
import { isDefaultPinHash } from '../shared/pin.js';

function parseActivo(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'activo';
}

export function resolveIdentity(req) {
  const headers = req.headers || {};
  const userId = headers['x-appwrite-user-id'] || '';
  const userJwt = headers['x-appwrite-user-jwt'] || '';

  return {
    userId: userId || null,
    isAuthenticated: Boolean(userId),
    isAdmin: false,
    isOperador: false,
    rol: null,
    operadorDocId: null,
    activo: false,
    cancelPinHash: null,
    pinNeedsReset: false,
    mustChangePassword: false,
    userJwt: userJwt || null,
  };
}

/**
 * Identidad solo desde colección operadores (sin ADMIN_USER_IDS).
 */
export async function enrichIdentity(req, identity) {
  if (!identity.userId) return identity;

  try {
    const repo = createOperadoresRepo(req);
    const doc = await repo.findByUserId(identity.userId);
    if (!doc) return identity;

    const rol = String(doc.rol || 'operador').toLowerCase();
    const activo = parseActivo(doc.activo);

    identity.operadorDocId = doc.$id;
    identity.rol = rol;
    identity.activo = activo;
    identity.cancelPinHash = doc.cancelPinHash || null;
    identity.pinNeedsReset = isDefaultPinHash(doc.cancelPinHash);
    identity.mustChangePassword =
      doc.mustChangePassword === true ||
      doc.mustChangePassword === 'true' ||
      doc.mustChangePassword === '1';
    identity.isAdmin = activo && rol === 'admin';
    identity.isOperador = activo && (rol === 'admin' || rol === 'operador');
  } catch {
    // colección no disponible
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
    if (!identity.isOperador) {
      throw new AppError(
        'FORBIDDEN',
        'Debes ser operador o administrador activo en la colección operadores',
        403,
      );
    }
  }

  if (routeAuth === AUTH.INTERNAL) {
    throw new AppError('FORBIDDEN', 'Acción solo interna', 403);
  }
}

export function assertOnlyAdmin(identity) {
  if (!identity.isAdmin) {
    throw new AppError('FORBIDDEN', 'Solo administradores',
      403);
  }
}

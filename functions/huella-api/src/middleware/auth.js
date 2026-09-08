import { Client, Account } from 'node-appwrite';
import { AppError } from '../shared/errors.js';
import { AUTH } from '../shared/constants.js';
import { createOperadoresRepo } from '../infrastructure/appwrite/appwrite.database.js';
import { createAdminClient } from '../infrastructure/appwrite/appwrite.client.js';
import { isDefaultPinHash } from '../shared/pin.js';

function parseActivo(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  if (s === '') return true;
  return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'activo';
}

function parseMustChangePassword(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1';
}

function endpoint() {
  return process.env.APPWRITE_ENDPOINT || process.env.APPWRITE_FUNCTION_API_ENDPOINT || '';
}

function projectId() {
  return process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_FUNCTION_PROJECT_ID || '';
}

/**
 * Resuelve identidad:
 * 1) x-appwrite-user-id (contexto Function Appwrite)
 * 2) JWT Bearer / x-appwrite-user-jwt (Render / HTTP)
 */
export async function resolveIdentity(req) {
  const headers = req.headers || {};
  let userId = headers['x-appwrite-user-id'] || '';
  let userJwt =
    headers['x-appwrite-user-jwt'] ||
    (String(headers['authorization'] || '').toLowerCase().startsWith('bearer ')
      ? String(headers['authorization']).slice(7).trim()
      : '');

  // Render: validar JWT con Appwrite Account
  if (!userId && userJwt) {
    try {
      const client = new Client()
        .setEndpoint(endpoint())
        .setProject(projectId())
        .setJWT(userJwt);
      const account = new Account(client);
      const user = await account.get();
      userId = user.$id;
    } catch (e) {
      // JWT inválido → queda sin autenticar
      userJwt = '';
      userId = '';
    }
  }

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

export async function enrichIdentity(req, identity) {
  if (!identity.userId) return identity;

  try {
    const repo = createOperadoresRepo(req);
    const doc = await repo.findByUserId(identity.userId);
    if (doc) {
      const rol = String(doc.rol || 'operador').toLowerCase();
      const activo = parseActivo(doc.activo);

      identity.operadorDocId = doc.$id;
      identity.rol = rol;
      identity.activo = activo;
      identity.cancelPinHash = doc.cancelPinHash || null;
      identity.pinNeedsReset = isDefaultPinHash(doc.cancelPinHash);
      identity.mustChangePassword = parseMustChangePassword(doc.mustChangePassword);
      identity.isAdmin = activo && rol === 'admin';
      identity.isOperador = activo && (rol === 'admin' || rol === 'operador');
      return identity;
    }
  } catch {
    // colección ausente
  }

  try {
    const { users } = createAdminClient(req);
    const user = await users.get(identity.userId);
    const labels = (user.labels || []).map((l) => String(l).toLowerCase());
    if (labels.includes('admin')) {
      identity.rol = 'admin';
      identity.isAdmin = true;
      identity.isOperador = true;
      identity.activo = true;
      identity.pinNeedsReset = true;
    } else if (labels.includes('operador')) {
      identity.rol = 'operador';
      identity.isOperador = true;
      identity.activo = true;
      identity.pinNeedsReset = true;
    }
  } catch {
    // sin Users API
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
        'Debes ser operador o administrador (colección operadores o label Appwrite admin/operador)',
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
    throw new AppError('FORBIDDEN', 'Solo administradores', 403);
  }
}

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

function roleFromLabels(labels) {
  const normalized = Array.isArray(labels)
    ? labels.map((label) => String(label).trim().toLowerCase())
    : [];

  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('operador')) return 'operador';
  return null;
}

export async function resolveIdentity(req) {
  const headers = req.headers || {};
  let userId = headers['x-appwrite-user-id'] || '';
  let userJwt =
    headers['x-appwrite-user-jwt'] ||
    (String(headers['authorization'] || '').toLowerCase().startsWith('bearer ')
      ? String(headers['authorization']).slice(7).trim()
      : '');

  if (!userId && userJwt) {
    try {
      const client = new Client()
        .setEndpoint(endpoint())
        .setProject(projectId())
        .setJWT(userJwt);
      const account = new Account(client);
      const user = await account.get();
      userId = user.$id;
    } catch {
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

  // Appwrite labels are the authoritative source for authorization.
  let labelRole = null;
  try {
    const { users } = createAdminClient(req);
    const user = await users.get(identity.userId);
    labelRole = roleFromLabels(user.labels);
  } catch (error) {
    identity.authRoleError = error?.message || 'No se pudieron leer los labels de Appwrite';
  }

  if (labelRole) {
    identity.rol = labelRole;
    identity.isAdmin = labelRole === 'admin';
    identity.isOperador = true;
    identity.activo = true;
  }

  try {
    const repo = createOperadoresRepo(req);
    const doc = await repo.findByUserId(identity.userId);
    if (doc) {
      const activo = parseActivo(doc.activo);

      identity.operadorDocId = doc.$id;
      identity.activo = activo;
      identity.cancelPinHash = doc.cancelPinHash || null;
      identity.pinNeedsReset = isDefaultPinHash(doc.cancelPinHash);
      identity.mustChangePassword = parseMustChangePassword(doc.mustChangePassword);

      // The profile can disable an operator, but cannot grant a role that the
      // Appwrite user labels do not currently contain.
      if (labelRole) {
        identity.isAdmin = labelRole === 'admin' && activo;
        identity.isOperador = activo;
      } else {
        identity.rol = null;
        identity.isAdmin = false;
        identity.isOperador = false;
      }
    }
  } catch (error) {
    identity.authProfileError = error?.message || 'No se pudo leer el perfil de operador';
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
        'Debes ser operador o administrador (label Appwrite admin/operador)',
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

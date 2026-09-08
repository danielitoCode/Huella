import type { Env } from './env';
import { adminClient, userFromJwt } from './appwrite';
import { Query } from 'node-appwrite';
import { isDefaultPinHash } from './pin';

export type Identity = {
  userId: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperador: boolean;
  rol: string | null;
  operadorDocId: string | null;
  pinNeedsReset: boolean;
  mustChangePassword: boolean;
};

function parseActivo(v: unknown) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return true;
  return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'activo';
}

export async function resolveIdentity(req: Request, env: Env): Promise<Identity> {
  const base: Identity = {
    userId: null,
    isAuthenticated: false,
    isAdmin: false,
    isOperador: false,
    rol: null,
    operadorDocId: null,
    pinNeedsReset: false,
    mustChangePassword: false,
  };

  let jwt =
    req.headers.get('x-appwrite-user-jwt') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!jwt) return base;

  let userId = '';
  try {
    const user = await userFromJwt(env, jwt);
    userId = user.$id;
  } catch {
    return base;
  }

  base.userId = userId;
  base.isAuthenticated = true;

  const { databases, users, ids } = adminClient(env);
  const salt = env.PIN_SALT || 'huella';

  try {
    const list = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.equal('userId', userId),
      Query.limit(1),
    ]);
    const doc = list.documents[0] as Record<string, unknown> | undefined;
    if (doc) {
      const rol = String(doc.rol || 'operador').toLowerCase();
      const activo = parseActivo(doc.activo);
      base.operadorDocId = String(doc.$id);
      base.rol = rol;
      base.pinNeedsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
      base.mustChangePassword = doc.mustChangePassword === true;
      base.isAdmin = activo && rol === 'admin';
      base.isOperador = activo && (rol === 'admin' || rol === 'operador');
      return base;
    }
  } catch {
    // sin colección
  }

  try {
    const user = await users.get(userId);
    const labels = (user.labels || []).map((l) => String(l).toLowerCase());
    if (labels.includes('admin')) {
      base.rol = 'admin';
      base.isAdmin = true;
      base.isOperador = true;
      base.pinNeedsReset = true;
    } else if (labels.includes('operador')) {
      base.rol = 'operador';
      base.isOperador = true;
      base.pinNeedsReset = true;
    }
  } catch {
    // ignore
  }

  return base;
}

export function assertOperador(id: Identity) {
  if (!id.isOperador) {
    const err = new Error('Debes ser operador o administrador');
    (err as Error & { code: string; status: number }).code = 'FORBIDDEN';
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

export function assertAdmin(id: Identity) {
  if (!id.isAdmin) {
    const err = new Error('Solo administradores');
    (err as Error & { code: string; status: number }).code = 'FORBIDDEN';
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

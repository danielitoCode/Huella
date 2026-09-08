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

function roleFromLabels(labels: unknown): 'admin' | 'operador' | null {
  const normalized = Array.isArray(labels)
      ? labels.map((label) => String(label).trim().toLowerCase())
      : [];

  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('operador')) return 'operador';
  return null;
}

function roleFromProfile(role: unknown): 'admin' | 'operador' | null {
  const normalized = String(role ?? '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'operador') return normalized;
  return null;
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

  const jwt =
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

  // Appwrite user labels are the authoritative source of role.
  // The operadores document is profile/operational metadata only.
  // Labels are the preferred source because the current management endpoints
  // keep them in sync. Existing operator accounts, however, may predate labels
  // and only have their role in the protected operadores profile. Keep that
  // profile as a migration fallback so a valid legacy administrator is not
  // locked out before an administrator can update its labels.
  let role: 'admin' | 'operador' | null = null;
  try {
    const user = await users.get(userId);
    role = roleFromLabels(user.labels);
  } catch {
    // Without the Appwrite user/labels, no privileged role is granted.
  }

  if (role) {
    base.rol = role;
    base.isAdmin = role === 'admin';
    base.isOperador = true;
    base.pinNeedsReset = true;
  }

  try {
    const list = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.equal('userId', userId),
      Query.limit(1),
    ]);
    const doc = list.documents[0] as Record<string, unknown> | undefined;

    if (doc) {
      const activo = parseActivo(doc.activo);
      base.operadorDocId = String(doc.$id);
      base.pinNeedsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
      base.mustChangePassword = doc.mustChangePassword === true;

      // A profile may disable an already-labelled operator, but it cannot grant
      // or change a role that is absent from Appwrite user labels.
      // A valid, active profile is the compatibility fallback for accounts
      // created before roles were synchronized to Appwrite labels. A label,
      // when present, always takes precedence over the profile role.
      if (!role && activo) {
        const profileRole = roleFromProfile(doc.rol);
        if (profileRole) {
          base.rol = profileRole;
          base.isAdmin = profileRole === 'admin';
          base.isOperador = true;
        }
      }

      // A profile may always disable an operator, including one with a label.
      if (!activo) {
        base.rol = null;
        base.isAdmin = false;
        base.isOperador = false;
      }
    }
  } catch {
    // Profile collection/document is optional for label-based authentication.
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

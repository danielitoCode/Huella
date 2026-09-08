/**
 * Gestión de operadores adaptada de list_users:
 * 1) JWT → Account.get (identidad real)
 * 2) Admin por labels Appwrite Auth
 * 3) CRUD Users con API key
 * 4) Perfil extendido en colección `operadores` (PIN, mustChangePassword)
 */
import { Databases, Query, ID } from 'node-appwrite';
import type { Env } from '../env';
import { dbIds } from '../env';
import {
  createAppwriteUsersGateway,
  getAppwriteConfig,
} from '../infrastructure/usersGateway';
import { isAdminByLabels, isOperadorByLabels, allowedAdminLabels } from '../domain/adminPolicy';
import {
  defaultPassword,
  defaultPin,
  hashPin,
  isDefaultPinHash,
  verifyPin,
} from '../pin';

function extractJwt(req: Request, payload: Record<string, unknown>): string | null {
  const h =
    req.headers.get('x-appwrite-user-jwt') ||
    req.headers.get('x-appwrite-jwt') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (h) return h;
  const fromBody =
    payload.requesterJwt || payload.jwt || payload.appwriteJwt || null;
  return fromBody ? String(fromBody) : null;
}

function parseActivo(v: unknown) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return true;
  return ['true', '1', 'si', 'sí', 'activo'].includes(s);
}

async function publicOp(
  doc: Record<string, unknown>,
  salt: string,
) {
  const pinNeedsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
  return {
    id: doc.$id,
    userId: doc.userId,
    email: doc.email,
    nombre: doc.nombre,
    rol: doc.rol,
    activo: parseActivo(doc.activo),
    pinNeedsReset,
    pinEstado: pinNeedsReset ? 'reseteado_0000' : 'configurado',
    mustChangePassword: doc.mustChangePassword === true,
    ultimoLoginAt: doc.ultimoLoginAt || null,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };
}

function databasesFromEnv(env: Env) {
  const config = getAppwriteConfig(env);
  const { Client } = require('node-appwrite') as typeof import('node-appwrite');
  // Prefer static import style - fix below without require
  return null as unknown as Databases;
}

export async function handleOperadores(
  action: string,
  payload: Record<string, unknown>,
  req: Request,
  env: Env,
) {
  const config = getAppwriteConfig(env);
  const gateway = createAppwriteUsersGateway(config);
  const adminLabels = allowedAdminLabels(env);
  const salt = env.PIN_SALT || 'huella';
  const ids = dbIds(env);

  // Databases client (mismo patrón admin key)
  const { Client } = await import('node-appwrite');
  const adminClient = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
  const databases = new Databases(adminClient);

  const jwt = extractJwt(req, payload);
  const { requesterId, requester } = await gateway.getRequester({ requesterJwt: jwt });

  if (!requesterId || !requester) {
    throw Object.assign(new Error('No autorizado. Inicie sesión (JWT requerido).'), {
      code: 'UNAUTHORIZED',
      status: 401,
    });
  }

  const labels = requester.labels || [];
  const isAdmin = isAdminByLabels(labels, adminLabels);
  const isOp = isOperadorByLabels(labels);

  if (!isOp) {
    throw Object.assign(new Error('Acceso denegado: se requiere label admin u operador.'), {
      code: 'FORBIDDEN',
      status: 403,
    });
  }

  const ensureAdmin = () => {
    if (!isAdmin) {
      throw Object.assign(new Error('Acceso denegado: se requiere rol Admin.'), {
        code: 'FORBIDDEN',
        status: 403,
      });
    }
  };

  async function findOperadorByUserId(userId: string) {
    const list = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.equal('userId', userId),
      Query.limit(1),
    ]);
    return list.documents[0] as unknown as Record<string, unknown> | undefined;
  }

  async function ensurePerfilDoc() {
    let doc = await findOperadorByUserId(requesterId);
    if (doc) return doc;

    // Auto-provision perfil (PIN 0000) — como me() anterior
    const pinHash = await hashPin(defaultPin(), salt);
    doc = (await databases.createDocument(ids.databaseId, ids.operadores, ID.unique(), {
      userId: requesterId,
      email: requester.email,
      nombre: requester.name || requester.email,
      rol: isAdmin ? 'admin' : 'operador',
      activo: 'true',
      cancelPinHash: pinHash,
      mustChangePassword: false,
    })) as unknown as Record<string, unknown>;
    return doc;
  }

  // ── me ──────────────────────────────────────────────
  if (action === 'operadores.me') {
    const doc = await ensurePerfilDoc();
    return publicOp(doc, salt);
  }

  // ── list (admin) ────────────────────────────────────
  if (action === 'operadores.list') {
    ensureAdmin();
    const res = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.limit(Math.min(Number(payload.limit) || 50, 100)),
    ]);
    const operadores = [];
    for (const d of res.documents) {
      operadores.push(await publicOp(d as unknown as Record<string, unknown>, salt));
    }
    return { operadores, total: res.total };
  }

  // ── create (admin) — Users.create + labels + perfil ─
  if (action === 'operadores.create') {
    ensureAdmin();
    const email = String(payload.email || '').trim().toLowerCase();
    const nombre = String(payload.nombre || '').trim();
    const rol = payload.rol === 'admin' ? 'admin' : 'operador';
    if (!email || !nombre) {
      throw Object.assign(new Error('nombre y email requeridos'), {
        code: 'VALIDATION',
        status: 400,
      });
    }

    const labelsForUser =
      rol === 'admin' ? ['admin', 'operador'] : ['operador'];

    const user = await gateway.create({
      email,
      password: defaultPassword(),
      name: nombre,
      labels: labelsForUser,
    });

    const pinHash = await hashPin(defaultPin(), salt);
    const doc = (await databases.createDocument(ids.databaseId, ids.operadores, ID.unique(), {
      userId: user.$id,
      email,
      nombre,
      rol,
      activo: 'true',
      cancelPinHash: pinHash,
      mustChangePassword: true,
    })) as unknown as Record<string, unknown>;

    return {
      ...(await publicOp(doc, salt)),
      passwordTemporal: defaultPassword(),
      mensaje: 'Cuenta creada. Password 12345678 · PIN 0000 (debe cambiarlos).',
    };
  }

  // ── setRole (admin) ─────────────────────────────────
  if (action === 'operadores.setRole') {
    ensureAdmin();
    const operadorId = String(payload.operadorId || '');
    const rol = payload.rol === 'admin' ? 'admin' : 'operador';
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      operadorId,
    )) as unknown as Record<string, unknown>;

    await gateway.updateLabels(
      String(doc.userId),
      rol === 'admin' ? ['admin', 'operador'] : ['operador'],
    );
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      rol,
    })) as unknown as Record<string, unknown>;
    return publicOp(updated, salt);
  }

  // ── setActive (admin) → Auth status + activo text ───
  if (action === 'operadores.setActive') {
    ensureAdmin();
    const operadorId = String(payload.operadorId || '');
    const activo = Boolean(payload.activo);
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      operadorId,
    )) as unknown as Record<string, unknown>;

    await gateway.updateStatus(String(doc.userId), activo);
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      activo: activo ? 'true' : 'false',
    })) as unknown as Record<string, unknown>;
    return publicOp(updated, salt);
  }

  // ── resetCancelPin (admin) ──────────────────────────
  if (action === 'operadores.resetCancelPin') {
    ensureAdmin();
    const operadorId = String(payload.operadorId || '');
    const pinHash = await hashPin(defaultPin(), salt);
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      cancelPinHash: pinHash,
    })) as unknown as Record<string, unknown>;
    return {
      ...(await publicOp(updated, salt)),
      mensaje: 'PIN reseteado a 0000',
    };
  }

  // ── resetPassword (admin) — como list_users setUserPassword ─
  if (action === 'operadores.resetPassword') {
    ensureAdmin();
    const operadorId = String(payload.operadorId || '');
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      operadorId,
    )) as unknown as Record<string, unknown>;

    await gateway.updatePassword(String(doc.userId), defaultPassword());
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      mustChangePassword: true,
    })) as unknown as Record<string, unknown>;
    return {
      ...(await publicOp(updated, salt)),
      passwordTemporal: defaultPassword(),
      mensaje: 'Contraseña reseteada a 12345678',
    };
  }

  // ── setOwnCancelPin (titular) ───────────────────────
  if (action === 'operadores.setOwnCancelPin') {
    const pin = String(payload.pin || '').trim();
    const pinActual = String(payload.pinActual || '').trim();
    if (!/^\d{4}$/.test(pin) || pin === defaultPin()) {
      throw Object.assign(new Error('PIN nuevo: 4 dígitos, distinto de 0000'), {
        code: 'VALIDATION',
        status: 400,
      });
    }
    const doc = await ensurePerfilDoc();
    const needsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
    if (needsReset) {
      if (pinActual && pinActual !== defaultPin()) {
        throw Object.assign(new Error('Tras reset el PIN actual es 0000'), {
          code: 'FORBIDDEN',
          status: 403,
        });
      }
    } else if (!(await verifyPin(pinActual, doc.cancelPinHash as string, salt))) {
      throw Object.assign(new Error('PIN actual incorrecto'), {
        code: 'FORBIDDEN',
        status: 403,
      });
    }
    const updated = (await databases.updateDocument(
      ids.databaseId,
      ids.operadores,
      String(doc.$id),
      { cancelPinHash: await hashPin(pin, salt) },
    )) as unknown as Record<string, unknown>;
    return { ...(await publicOp(updated, salt)), mensaje: 'PIN actualizado' };
  }

  // ── changeOwnPassword (titular) ─────────────────────
  if (action === 'operadores.changeOwnPassword') {
    const passwordNueva = String(payload.passwordNueva || '').trim();
    if (passwordNueva.length < 8 || passwordNueva === defaultPassword()) {
      throw Object.assign(new Error('Password inválida'), {
        code: 'VALIDATION',
        status: 400,
      });
    }
    await gateway.updatePassword(requesterId, passwordNueva);
    const doc = await findOperadorByUserId(requesterId);
    if (doc) {
      await databases.updateDocument(ids.databaseId, ids.operadores, String(doc.$id), {
        mustChangePassword: false,
      });
    }
    return { passwordActualizada: true, mensaje: 'Contraseña actualizada' };
  }

  throw Object.assign(new Error(`Acción desconocida: ${action}`), {
    code: 'INVALID_ACTION',
    status: 400,
  });
}

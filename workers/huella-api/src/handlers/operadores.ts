import type { Env } from '../env';
import type { Identity } from '../auth';
import { assertAdmin, assertOperador } from '../auth';
import { adminClient } from '../appwrite';
import { Query } from 'node-appwrite';
import {
  defaultPassword,
  defaultPin,
  hashPin,
  isDefaultPinHash,
  verifyPin,
} from '../pin';

function parseActivo(v: unknown) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return true;
  return ['true', '1', 'si', 'sí', 'activo'].includes(s);
}

function publicOp(doc: Record<string, unknown>, salt: string, pinNeedsReset: boolean) {
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

export async function handleOperadores(
  action: string,
  payload: Record<string, unknown>,
  identity: Identity,
  env: Env,
) {
  const { databases, users, ID, ids } = adminClient(env);
  const salt = env.PIN_SALT || 'huella';

  if (action === 'operadores.me') {
    assertOperador(identity);
    if (!identity.userId) throw Object.assign(new Error('Sin sesión'), { code: 'UNAUTHORIZED', status: 401 });

    let list = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.equal('userId', identity.userId),
      Query.limit(1),
    ]);
    let doc = list.documents[0] as Record<string, unknown> | undefined;

    if (!doc) {
      // auto-provision desde labels (como password_reset admin pattern)
      const user = await users.get(identity.userId);
      const labels = (user.labels || []).map((l) => String(l).toLowerCase());
      const isAdmin = labels.includes('admin');
      if (!isAdmin && !labels.includes('operador')) {
        throw Object.assign(new Error('Sin registro de operador'), { code: 'FORBIDDEN', status: 403 });
      }
      const pinHash = await hashPin(defaultPin(), salt);
      doc = (await databases.createDocument(ids.databaseId, ids.operadores, ID.unique(), {
        userId: identity.userId,
        email: user.email,
        nombre: user.name || user.email,
        rol: isAdmin ? 'admin' : 'operador',
        activo: 'true',
        cancelPinHash: pinHash,
        mustChangePassword: false,
      })) as unknown as Record<string, unknown>;
    }

    const pinNeedsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
    return publicOp(doc, salt, pinNeedsReset);
  }

  if (action === 'operadores.list') {
    assertAdmin(identity);
    const limit = Math.min(Number(payload.limit) || 50, 100);
    const res = await databases.listDocuments(ids.databaseId, ids.operadores, [Query.limit(limit)]);
    const operadores = await Promise.all(
      res.documents.map(async (d) => {
        const doc = d as unknown as Record<string, unknown>;
        const pinNeedsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
        return publicOp(doc, salt, pinNeedsReset);
      }),
    );
    return { operadores, total: res.total };
  }

  if (action === 'operadores.create') {
    assertAdmin(identity);
    const email = String(payload.email || '').trim().toLowerCase();
    const nombre = String(payload.nombre || '').trim();
    const rol = payload.rol === 'admin' ? 'admin' : 'operador';
    if (!email || !nombre) {
      throw Object.assign(new Error('nombre y email requeridos'), { code: 'VALIDATION', status: 400 });
    }

    const user = await users.create(ID.unique(), email, undefined, defaultPassword(), nombre);
    await users.updateLabels(user.$id, rol === 'admin' ? ['admin', 'operador'] : ['operador']);
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
      ...publicOp(doc, salt, true),
      passwordTemporal: defaultPassword(),
      mensaje: 'Cuenta creada. Password 12345678 · PIN 0000 (debe cambiarlos).',
    };
  }

  if (action === 'operadores.setRole') {
    assertAdmin(identity);
    const operadorId = String(payload.operadorId || '');
    const rol = payload.rol === 'admin' ? 'admin' : 'operador';
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      operadorId,
    )) as unknown as Record<string, unknown>;
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      rol,
    })) as unknown as Record<string, unknown>;
    await users.updateLabels(
      String(doc.userId),
      rol === 'admin' ? ['admin', 'operador'] : ['operador'],
    );
    const pinNeedsReset = await isDefaultPinHash(updated.cancelPinHash as string, salt);
    return publicOp(updated, salt, pinNeedsReset);
  }

  if (action === 'operadores.setActive') {
    assertAdmin(identity);
    const operadorId = String(payload.operadorId || '');
    const activo = Boolean(payload.activo);
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      activo: activo ? 'true' : 'false',
    })) as unknown as Record<string, unknown>;
    const pinNeedsReset = await isDefaultPinHash(updated.cancelPinHash as string, salt);
    return publicOp(updated, salt, pinNeedsReset);
  }

  if (action === 'operadores.resetCancelPin') {
    assertAdmin(identity);
    const operadorId = String(payload.operadorId || '');
    const pinHash = await hashPin(defaultPin(), salt);
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      cancelPinHash: pinHash,
    })) as unknown as Record<string, unknown>;
    return {
      ...publicOp(updated, salt, true),
      mensaje: 'PIN reseteado a 0000',
    };
  }

  if (action === 'operadores.resetPassword') {
    assertAdmin(identity);
    const operadorId = String(payload.operadorId || '');
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      operadorId,
    )) as unknown as Record<string, unknown>;
    await users.updatePassword(String(doc.userId), defaultPassword());
    const updated = (await databases.updateDocument(ids.databaseId, ids.operadores, operadorId, {
      mustChangePassword: true,
    })) as unknown as Record<string, unknown>;
    const pinNeedsReset = await isDefaultPinHash(updated.cancelPinHash as string, salt);
    return {
      ...publicOp(updated, salt, pinNeedsReset),
      passwordTemporal: defaultPassword(),
      mensaje: 'Contraseña reseteada a 12345678',
    };
  }

  if (action === 'operadores.setOwnCancelPin') {
    assertOperador(identity);
    const pin = String(payload.pin || '').trim();
    const pinActual = String(payload.pinActual || '').trim();
    if (!/^\d{4}$/.test(pin) || pin === defaultPin()) {
      throw Object.assign(new Error('PIN nuevo: 4 dígitos, distinto de 0000'), {
        code: 'VALIDATION',
        status: 400,
      });
    }
    if (!identity.operadorDocId) {
      throw Object.assign(new Error('Sin perfil'), { code: 'NOT_FOUND', status: 404 });
    }
    const doc = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      identity.operadorDocId,
    )) as unknown as Record<string, unknown>;
    const needsReset = await isDefaultPinHash(doc.cancelPinHash as string, salt);
    if (needsReset) {
      if (pinActual && pinActual !== defaultPin()) {
        throw Object.assign(new Error('Tras reset el PIN actual es 0000'), {
          code: 'FORBIDDEN',
          status: 403,
        });
      }
    } else if (!(await verifyPin(pinActual, doc.cancelPinHash as string, salt))) {
      throw Object.assign(new Error('PIN actual incorrecto'), { code: 'FORBIDDEN', status: 403 });
    }
    const updated = (await databases.updateDocument(
      ids.databaseId,
      ids.operadores,
      identity.operadorDocId,
      { cancelPinHash: await hashPin(pin, salt) },
    )) as unknown as Record<string, unknown>;
    return { ...publicOp(updated, salt, false), mensaje: 'PIN actualizado' };
  }

  if (action === 'operadores.changeOwnPassword') {
    assertOperador(identity);
    if (!identity.userId) throw Object.assign(new Error('Sin sesión'), { code: 'UNAUTHORIZED', status: 401 });
    const passwordNueva = String(payload.passwordNueva || '').trim();
    if (passwordNueva.length < 8 || passwordNueva === defaultPassword()) {
      throw Object.assign(new Error('Password inválida'), { code: 'VALIDATION', status: 400 });
    }
    await users.updatePassword(identity.userId, passwordNueva);
    if (identity.operadorDocId) {
      await databases.updateDocument(ids.databaseId, ids.operadores, identity.operadorDocId, {
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

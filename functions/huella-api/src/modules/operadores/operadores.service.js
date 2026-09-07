import { AppError } from '../../shared/errors.js';
import { createAdminClient } from '../../infrastructure/appwrite/appwrite.client.js';
import { createOperadoresRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import {
  hashPin,
  verifyPin,
  isDefaultPinHash,
  DEFAULT_CANCEL_PIN,
  DEFAULT_PASSWORD,
} from '../../shared/pin.js';
import { assertOnlyAdmin } from '../../middleware/auth.js';

function parseActivo(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'activo';
}

function publicOperador(doc, { forAdmin = false } = {}) {
  const pinReset = isDefaultPinHash(doc.cancelPinHash);
  const base = {
    id: doc.$id,
    userId: doc.userId,
    email: doc.email,
    nombre: doc.nombre,
    rol: doc.rol,
    activo: parseActivo(doc.activo),
    /** true si el PIN es el de fábrica 0000 (reseteado o nunca personalizado) */
    pinNeedsReset: pinReset,
    /** Para auditoría admin: estado legible del PIN (nunca el valor en claro si está personalizado) */
    pinEstado: pinReset ? 'reseteado_0000' : 'configurado',
    mustChangePassword:
      doc.mustChangePassword === true ||
      doc.mustChangePassword === 'true' ||
      doc.mustChangePassword === '1',
    ultimoLoginAt: doc.ultimoLoginAt || null,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };

  // Auditoría: el admin ve el valor de fábrica cuando está reseteado
  if (forAdmin && pinReset) {
    base.pinVisibleAuditoria = DEFAULT_CANCEL_PIN;
  }

  return base;
}

async function syncLabels(users, userId, rol) {
  try {
    const labels = rol === 'admin' ? ['admin', 'operador'] : ['operador'];
    await users.updateLabels(userId, labels);
  } catch {
    // opcional
  }
}

export function createOperadoresService(req) {
  const repo = createOperadoresRepo(req);
  const { users, ID } = createAdminClient(req);

  return {
    async me({ identity }) {
      if (!identity.userId) throw new AppError('UNAUTHORIZED', 'Sin sesión', 401);
      const doc = await repo.findByUserId(identity.userId);
      if (!doc) {
        throw new AppError(
          'FORBIDDEN',
          'No hay registro en operadores para esta cuenta. Un administrador debe crearla.',
          403,
        );
      }
      if (!parseActivo(doc.activo)) {
        throw new AppError('FORBIDDEN', 'Cuenta desactivada', 403);
      }
      return publicOperador(doc, { forAdmin: String(doc.rol).toLowerCase() === 'admin' });
    },

    async list(payload, identity) {
      assertOnlyAdmin(identity);
      const { documents, total } = await repo.list(payload);
      return {
        operadores: documents.map((d) => publicOperador(d, { forAdmin: true })),
        total,
        limit: payload.limit,
        offset: payload.offset,
      };
    },

    /**
     * Admin crea cuenta.
     * Password inicial = DEFAULT_PASSWORD (mustChangePassword).
     * PIN inicial = 0000 (pinNeedsReset).
     */
    async create(input, identity) {
      assertOnlyAdmin(identity);

      const existing = await repo.findByEmail(input.email);
      if (existing) throw new AppError('CONFLICT', 'Ya existe un operador con ese email', 409);

      let user;
      try {
        user = await users.create(
          ID.unique(),
          input.email,
          undefined,
          DEFAULT_PASSWORD,
          input.nombre,
        );
      } catch (e) {
        throw new AppError('APPWRITE', e?.message || 'No se pudo crear el usuario', 502);
      }

      await syncLabels(users, user.$id, input.rol);

      const doc = await repo.create({
        userId: user.$id,
        email: input.email,
        nombre: input.nombre,
        rol: input.rol,
        activo: 'true',
        cancelPinHash: hashPin(DEFAULT_CANCEL_PIN),
        mustChangePassword: 'true',
      });

      return {
        ...publicOperador(doc, { forAdmin: true }),
        passwordTemporal: DEFAULT_PASSWORD,
        mensaje:
          'Cuenta creada. Contraseña temporal 12345678 y PIN 0000: el usuario debe cambiarlos al entrar.',
      };
    },

    async setRole({ operadorId, rol }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      if (doc.rol === 'admin' && rol !== 'admin') {
        const { documents } = await repo.list({ limit: 100 });
        const admins = documents.filter(
          (d) => d.rol === 'admin' && parseActivo(d.activo),
        );
        if (admins.length <= 1 && admins[0]?.$id === doc.$id) {
          throw new AppError('VALIDATION', 'No puedes degradar al único administrador activo');
        }
      }

      const updated = await repo.update(operadorId, { rol });
      await syncLabels(users, doc.userId, rol);
      return publicOperador(updated, { forAdmin: true });
    },

    async setActive({ operadorId, activo }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      if (!activo && doc.rol === 'admin') {
        const { documents } = await repo.list({ limit: 100 });
        const admins = documents.filter(
          (d) => d.rol === 'admin' && parseActivo(d.activo),
        );
        if (admins.length <= 1 && admins[0]?.$id === doc.$id) {
          throw new AppError('VALIDATION', 'No puedes desactivar al único administrador');
        }
      }

      // Schema Appwrite: activo es text
      const updated = await repo.update(operadorId, { activo: activo ? 'true' : 'false' });
      return publicOperador(updated, { forAdmin: true });
    },

    /** Admin: solo resetea PIN a 0000 (no elige otro valor). */
    async resetCancelPin({ operadorId }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      const updated = await repo.update(operadorId, {
        cancelPinHash: hashPin(DEFAULT_CANCEL_PIN),
      });

      return {
        ...publicOperador(updated, { forAdmin: true }),
        mensaje: 'PIN reseteado a 0000. El operador debe establecer uno nuevo.',
      };
    },

    /**
     * El titular establece su PIN personal.
     * Solo permitido si el actual es 0000 (reseteado) o si envía el PIN actual correcto y uno nuevo.
     * Política: tras reset solo se acepta cambio desde 0000 → nuevo (≠ 0000).
     */
    async setOwnCancelPin({ pin, pinActual }, identity) {
      if (!identity.operadorDocId) {
        throw new AppError('FORBIDDEN', 'Sin perfil de operador', 403);
      }
      const doc = await repo.getById(identity.operadorDocId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      const nuevo = String(pin).trim();
      if (!/^\d{4}$/.test(nuevo)) {
        throw new AppError('VALIDATION', 'El nuevo PIN debe ser 4 dígitos');
      }
      if (nuevo === DEFAULT_CANCEL_PIN) {
        throw new AppError(
          'VALIDATION',
          'No puedes usar 0000 como PIN definitivo. Elige otro de 4 dígitos.',
        );
      }

      const needsReset = isDefaultPinHash(doc.cancelPinHash);

      if (needsReset) {
        // Debe confirmar que conoce el valor de fábrica (auditoría de reseteo)
        if (pinActual != null && String(pinActual).trim() !== DEFAULT_CANCEL_PIN) {
          throw new AppError(
            'FORBIDDEN',
            'Tras un reseteo el PIN actual es 0000. Introdúcelo para establecer el nuevo.',
            403,
          );
        }
      } else {
        // Cambio voluntario: exige PIN actual
        if (!pinActual || !verifyPin(pinActual, doc.cancelPinHash)) {
          throw new AppError('FORBIDDEN', 'PIN actual incorrecto', 403);
        }
      }

      const updated = await repo.update(doc.$id, {
        cancelPinHash: hashPin(nuevo),
      });

      return {
        ...publicOperador(updated),
        mensaje: 'PIN de cancelación actualizado.',
      };
    },

    /** Admin: solo resetea password a 12345678 + flag mustChangePassword. */
    async resetPassword({ operadorId }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      try {
        await users.updatePassword(doc.userId, DEFAULT_PASSWORD);
      } catch (e) {
        throw new AppError('APPWRITE', e?.message || 'No se pudo resetear la contraseña', 502);
      }

      let updated = doc;
      try {
        updated = await repo.update(operadorId, { mustChangePassword: 'true' });
      } catch {
        // atributo opcional si aún no existe en schema
      }

      return {
        ...publicOperador(updated, { forAdmin: true }),
        passwordTemporal: DEFAULT_PASSWORD,
        mensaje:
          'Contraseña reseteada a 12345678. Al iniciar sesión se pedirá una nueva.',
      };
    },

    /** Titular cambia su contraseña (obligatorio si mustChangePassword). */
    async changeOwnPassword({ passwordActual, passwordNueva }, identity) {
      if (!identity.userId || !identity.operadorDocId) {
        throw new AppError('UNAUTHORIZED', 'Sin sesión', 401);
      }

      const nueva = String(passwordNueva || '').trim();
      if (nueva.length < 8) {
        throw new AppError('VALIDATION', 'La nueva contraseña debe tener al menos 8 caracteres');
      }
      if (nueva === DEFAULT_PASSWORD) {
        throw new AppError('VALIDATION', 'No puedes reutilizar la contraseña temporal 12345678');
      }

      // Appwrite Users API no verifica la actual con API key fácilmente;
      // confiamos en sesión JWT activa + flag. Opcional: exigir passwordActual === DEFAULT si mustChange.
      const doc = await repo.getById(identity.operadorDocId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      const must =
        doc.mustChangePassword === true ||
        doc.mustChangePassword === 'true' ||
        doc.mustChangePassword === '1';

      if (must) {
        const actual = String(passwordActual || '').trim();
        if (actual && actual !== DEFAULT_PASSWORD) {
          throw new AppError(
            'FORBIDDEN',
            'Tras un reseteo la contraseña actual es 12345678',
            403,
          );
        }
      }

      try {
        await users.updatePassword(identity.userId, nueva);
      } catch (e) {
        throw new AppError('APPWRITE', e?.message || 'No se pudo actualizar la contraseña', 502);
      }

      try {
        await repo.update(identity.operadorDocId, { mustChangePassword: 'false' });
      } catch {
        // ignore
      }

      return { passwordActualizada: true, mensaje: 'Contraseña actualizada correctamente.' };
    },

    /**
     * Cancelación: exige PIN personal configurado (no 0000).
     */
    async assertCancelPin(identity, pin) {
      if (!identity?.userId) {
        throw new AppError('UNAUTHORIZED', 'Sesión requerida', 401);
      }

      const doc =
        (identity.operadorDocId && (await repo.getById(identity.operadorDocId))) ||
        (await repo.findByUserId(identity.userId));

      if (!doc) {
        throw new AppError('FORBIDDEN', 'Operador no registrado', 403);
      }

      if (isDefaultPinHash(doc.cancelPinHash)) {
        throw new AppError(
          'PIN_RESET_REQUIRED',
          'Tu PIN de cancelación fue reseteado a 0000. Debes establecer un PIN personal antes de cancelar solicitudes.',
          403,
        );
      }

      if (!verifyPin(pin, doc.cancelPinHash)) {
        throw new AppError('FORBIDDEN', 'PIN de cancelación incorrecto', 403);
      }

      return true;
    },
  };
}

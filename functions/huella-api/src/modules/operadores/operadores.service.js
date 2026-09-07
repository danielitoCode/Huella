import { AppError } from '../../shared/errors.js';
import { createAdminClient } from '../../infrastructure/appwrite/appwrite.client.js';
import { createOperadoresRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import { hashPin, verifyPin, verifyGlobalCancelPin } from '../../shared/pin.js';
import { assertOnlyAdmin } from '../../middleware/auth.js';

function publicOperador(doc) {
  return {
    id: doc.$id,
    userId: doc.userId,
    email: doc.email,
    nombre: doc.nombre,
    rol: doc.rol,
    activo: doc.activo === true || doc.activo === 'true' || doc.activo === '1',
    tienePin: Boolean(doc.cancelPinHash),
    ultimoLoginAt: doc.ultimoLoginAt || null,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };
}

async function syncLabels(users, userId, rol) {
  try {
    // Labels Appwrite: admin / operador
    const labels = rol === 'admin' ? ['admin', 'operador'] : ['operador'];
    await users.updateLabels(userId, labels);
  } catch {
    // labels opcionales según plan/API
  }
}

export function createOperadoresService(req) {
  const repo = createOperadoresRepo(req);
  const { users, ID } = createAdminClient(req);

  return {
    async me({ identity }) {
      if (!identity.userId) throw new AppError('UNAUTHORIZED', 'Sin sesión', 401);
      let doc = await repo.findByUserId(identity.userId);

      // Auto-provision bootstrap admin en primera visita
      if (!doc && identity.isAdmin) {
        try {
          const user = await users.get(identity.userId);
          doc = await repo.create({
            userId: identity.userId,
            email: user.email,
            nombre: user.name || user.email,
            rol: 'admin',
            activo: true,
            cancelPinHash: null,
          });
        } catch (e) {
          throw new AppError(
            'CONFIG',
            'No se pudo registrar el operador. Revisa colección operadores y API key.',
            500,
          );
        }
      }

      if (!doc) {
        throw new AppError('FORBIDDEN', 'No eres operador registrado en Huella', 403);
      }

      return publicOperador(doc);
    },

    async list(payload, identity) {
      assertOnlyAdmin(identity);
      const { documents, total } = await repo.list(payload);
      return {
        operadores: documents.map(publicOperador),
        total,
        limit: payload.limit,
        offset: payload.offset,
      };
    },

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
          input.password,
          input.nombre,
        );
      } catch (e) {
        const msg = e?.message || 'No se pudo crear el usuario en Appwrite';
        throw new AppError('APPWRITE', msg, 502);
      }

      await syncLabels(users, user.$id, input.rol);

      const doc = await repo.create({
        userId: user.$id,
        email: input.email,
        nombre: input.nombre,
        rol: input.rol,
        activo: true,
        cancelPinHash: input.cancelPin ? hashPin(input.cancelPin) : null,
      });

      return publicOperador(doc);
    },

    async setRole({ operadorId, rol }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      // Evitar dejar el sistema sin admins: si baja el único admin, bloquear
      if (doc.rol === 'admin' && rol !== 'admin') {
        const { documents } = await repo.list({ limit: 100 });
        const admins = documents.filter(
          (d) => d.rol === 'admin' && (d.activo === true || d.activo === 'true'),
        );
        if (admins.length <= 1 && admins[0]?.$id === doc.$id) {
          throw new AppError('VALIDATION', 'No puedes degradar al único administrador activo');
        }
      }

      const updated = await repo.update(operadorId, { rol });
      await syncLabels(users, doc.userId, rol);
      return publicOperador(updated);
    },

    async setActive({ operadorId, activo }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      if (!activo && doc.rol === 'admin') {
        const { documents } = await repo.list({ limit: 100 });
        const admins = documents.filter(
          (d) => d.rol === 'admin' && (d.activo === true || d.activo === 'true'),
        );
        if (admins.length <= 1 && admins[0]?.$id === doc.$id) {
          throw new AppError('VALIDATION', 'No puedes desactivar al único administrador');
        }
      }

      const updated = await repo.update(operadorId, { activo });
      return publicOperador(updated);
    },

    /**
     * Admin: puede fijar PIN de cualquiera.
     * Operador: solo el suyo (operadorId omitido o propio).
     */
    async setCancelPin({ operadorId, pin }, identity) {
      let targetId = operadorId;

      if (!targetId) {
        if (!identity.operadorDocId) {
          throw new AppError('VALIDATION', 'operadorId requerido o sesión sin perfil');
        }
        targetId = identity.operadorDocId;
      }

      const doc = await repo.getById(targetId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      const isSelf = doc.userId === identity.userId;
      if (!isSelf) assertOnlyAdmin(identity);

      const updated = await repo.update(targetId, {
        cancelPinHash: hashPin(pin),
      });

      return { ...publicOperador(updated), pinActualizado: true };
    },

    async setPassword({ operadorId, password }, identity) {
      assertOnlyAdmin(identity);
      const doc = await repo.getById(operadorId);
      if (!doc) throw new AppError('NOT_FOUND', 'Operador no encontrado', 404);

      try {
        await users.updatePassword(doc.userId, password);
      } catch (e) {
        throw new AppError('APPWRITE', e?.message || 'No se pudo actualizar la contraseña', 502);
      }

      return { operadorId, passwordActualizada: true };
    },

    /** Verifica PIN del operador que cancela (o fallback global). */
    async assertCancelPin(identity, pin) {
      if (identity.cancelPinHash && verifyPin(pin, identity.cancelPinHash)) {
        return true;
      }
      // Si el identity no trae hash, recargar doc
      if (identity.userId) {
        const doc = await repo.findByUserId(identity.userId);
        if (doc?.cancelPinHash && verifyPin(pin, doc.cancelPinHash)) return true;
      }
      if (verifyGlobalCancelPin(pin)) return true;
      throw new AppError('FORBIDDEN', 'PIN de cancelación incorrecto', 403);
    },
  };
}

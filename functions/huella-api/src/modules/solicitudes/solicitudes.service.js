import { AppError } from '../../shared/errors.js';
import { ESTADOS, TRANSICIONES, EMAIL_TEMPLATES } from '../../shared/constants.js';
import { generarCodigoSeguimiento } from '../../shared/codigo.js';
import { createSolicitudesRepo, createKycRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import { createDiditSession } from '../../infrastructure/didit/didit.client.js';
import { sendEmail } from '../../infrastructure/email/email.client.js';
import { renderTemplate } from '../email/email.templates.js';

function assertTransition(from, to) {
  const allowed = TRANSICIONES[to] || [];
  if (!allowed.includes(from)) {
    throw new AppError(
      'INVALID_TRANSITION',
      `No se puede pasar de "${from}" a "${to}"`,
    );
  }
}

function appendNota(existing, label, text) {
  const block = `[${label}] ${text}`;
  return [existing, block].filter(Boolean).join('\n---\n');
}

function verifyCancelPin(pin) {
  const expected = String(process.env.BACKOFFICE_CANCEL_PIN || '').trim();
  if (!expected) {
    throw new AppError(
      'CONFIG',
      'BACKOFFICE_CANCEL_PIN no configurado en huella-api. El administrador debe definir un PIN de 4 dígitos.',
      500,
    );
  }
  if (expected !== pin) {
    throw new AppError('FORBIDDEN', 'PIN de cancelación incorrecto', 403);
  }
}

export function createSolicitudesService(req) {
  const repo = createSolicitudesRepo(req);
  const kycRepo = createKycRepo(req);
  const publicUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

  async function startDiditKyc(doc, solicitudId, operatorId, notasInternas) {
    const session = await createDiditSession({
      vendorData: doc.$id,
      callbackUrl: process.env.DIDIT_CALLBACK_URL,
    });

    const updated = await repo.update(solicitudId, {
      estado: ESTADOS.SIN_VERIFICAR,
      diditSessionId: session.sessionId,
      notasInternas: notasInternas
        ? appendNota(doc.notasInternas, 'KYC', notasInternas)
        : doc.notasInternas ?? null,
      mensajePublico:
        'Te enviamos un enlace para verificar tu identidad. Revisa tu correo.',
    });

    await kycRepo.create({
      solicitud_id: solicitudId,
      user_id: operatorId || null,
      didit_session_id: session.sessionId,
      status: 'Not Started',
      codigo_seguimiento: doc.codigoSeguimiento,
    });

    const tpl = renderTemplate(EMAIL_TEMPLATES.KYC_LINK, {
      nombreFamiliar: doc.nombreFamiliar,
      codigo: doc.codigoSeguimiento,
      verificationUrl: session.url,
    });
    await sendEmail({ to: doc.email, ...tpl });

    return {
      estado: updated.estado,
      sessionId: session.sessionId,
      verificationUrl: session.url,
    };
  }

  return {
    async create(input) {
      let codigo = generarCodigoSeguimiento();
      for (let i = 0; i < 3; i++) {
        const existing = await repo.findByCodigo(codigo);
        if (!existing) break;
        codigo = generarCodigoSeguimiento();
      }

      const doc = await repo.create({
        codigoSeguimiento: codigo,
        nombreFamiliar: input.nombreFamiliar,
        email: input.email,
        telefono: input.telefono || null,
        nombrePersona: input.nombrePersona,
        relacion: input.relacion,
        descripcion: input.descripcion,
        estado: ESTADOS.PENDIENTE,
        mensajePublico: 'Hemos recibido tu solicitud. Pronto la revisaremos.',
      });

      const trackingUrl = `${publicUrl}/seguimiento/${codigo}`;
      const tpl = renderTemplate(EMAIL_TEMPLATES.TRACKING, {
        nombreFamiliar: input.nombreFamiliar,
        codigo,
        trackingUrl,
      });
      await sendEmail({ to: input.email, ...tpl });

      return {
        codigoSeguimiento: codigo,
        trackingUrl,
        estado: ESTADOS.PENDIENTE,
        id: doc.$id,
      };
    },

    async getByCode({ codigo }) {
      const doc = await repo.findByCodigo(codigo);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      return {
        codigoSeguimiento: doc.codigoSeguimiento,
        estado: doc.estado,
        mensajePublico: doc.mensajePublico || null,
        fechaCreacion: doc.$createdAt,
        fechaActualizacion: doc.$updatedAt,
        kycCompletado: doc.estado === ESTADOS.VERIFICADO || doc.estado === ESTADOS.CERRADO,
      };
    },

    /** pendiente → sin_verificar (atendido). KYC opcional. */
    async marcarAtendido({ solicitudId, notasInternas, mensajePublico, iniciarKyc, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.SIN_VERIFICAR);

      if (iniciarKyc) {
        const kyc = await startDiditKyc(doc, solicitudId, operatorId, notasInternas);
        return { solicitudId, ...kyc };
      }

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.SIN_VERIFICAR,
        notasInternas: notasInternas
          ? appendNota(doc.notasInternas, 'ATENDIDO', notasInternas)
          : doc.notasInternas ?? null,
        mensajePublico:
          mensajePublico ||
          'Tu solicitud está siendo atendida por nuestro equipo.',
      });

      return { solicitudId, estado: updated.estado, sessionId: null, verificationUrl: null };
    },

    /** Alias legacy: atender + Didit */
    async marcarSinVerificar(args) {
      return this.marcarAtendido({ ...args, iniciarKyc: true });
    },

    /** Solo inicia Didit si ya está en sin_verificar */
    async iniciarKyc({ solicitudId, notasInternas, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      if (doc.estado !== ESTADOS.SIN_VERIFICAR) {
        throw new AppError(
          'INVALID_TRANSITION',
          'Solo se puede iniciar KYC desde el estado atendido (sin_verificar)',
        );
      }
      const kyc = await startDiditKyc(doc, solicitudId, operatorId, notasInternas);
      return { solicitudId, ...kyc };
    },

    /** Verificación manual (baja conectividad / vía extraoficial) */
    async marcarVerificado({ solicitudId, motivo, mensajePublico }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.VERIFICADO);

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.VERIFICADO,
        kycResultado: 'manual',
        notasInternas: appendNota(doc.notasInternas, 'VERIFICADO_MANUAL', motivo),
        mensajePublico:
          mensajePublico ||
          'La identidad del solicitante ha sido confirmada. Continuamos con la investigación.',
      });

      return { solicitudId, estado: updated.estado };
    },

    async list({ estado, limit = 25, offset = 0 } = {}) {
      const { documents, total } = await repo.list({ estado, limit, offset });
      return {
        solicitudes: documents.map((doc) => ({
          id: doc.$id,
          codigoSeguimiento: doc.codigoSeguimiento,
          nombreFamiliar: doc.nombreFamiliar,
          email: doc.email,
          nombrePersona: doc.nombrePersona,
          relacion: doc.relacion,
          estado: doc.estado,
          mensajePublico: doc.mensajePublico || null,
          diditSessionId: doc.diditSessionId || null,
          fechaCreacion: doc.$createdAt,
          fechaActualizacion: doc.$updatedAt,
        })),
        total,
        limit,
        offset,
      };
    },

    async getById({ solicitudId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      return {
        id: doc.$id,
        codigoSeguimiento: doc.codigoSeguimiento,
        nombreFamiliar: doc.nombreFamiliar,
        email: doc.email,
        telefono: doc.telefono || null,
        nombrePersona: doc.nombrePersona,
        relacion: doc.relacion,
        descripcion: doc.descripcion,
        estado: doc.estado,
        mensajePublico: doc.mensajePublico || null,
        notasInternas: doc.notasInternas || null,
        diditSessionId: doc.diditSessionId || null,
        kycResultado: doc.kycResultado || null,
        fechaCreacion: doc.$createdAt,
        fechaActualizacion: doc.$updatedAt,
      };
    },

    async cerrar({ solicitudId, motivoInterno, mensajePublico }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.CERRADO);

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.CERRADO,
        notasInternas: appendNota(doc.notasInternas, 'CIERRE', motivoInterno),
        mensajePublico:
          mensajePublico ||
          'Tu expediente ha sido cerrado. Gracias por contactarnos.',
      });

      return { solicitudId, estado: updated.estado };
    },

    async cancelar({ solicitudId, motivoInterno, pin }) {
      verifyCancelPin(pin);
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.CANCELADA);

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.CANCELADA,
        notasInternas: appendNota(
          doc.notasInternas,
          'CANCELADA',
          `${motivoInterno} (confirmación PIN OK)`,
        ),
        mensajePublico: 'Esta solicitud ha sido cancelada.',
      });

      return { solicitudId, estado: updated.estado };
    },
  };
}

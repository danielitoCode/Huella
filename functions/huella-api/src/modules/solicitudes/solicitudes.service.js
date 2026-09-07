import { AppError } from '../../shared/errors.js';
import { ESTADOS, TRANSICIONES, EMAIL_TEMPLATES } from '../../shared/constants.js';
import { generarCodigoSeguimiento } from '../../shared/codigo.js';
import { createSolicitudesRepo, createKycRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import { createDiditSession } from '../../infrastructure/didit/didit.client.js';
import { sendEmail } from '../../infrastructure/email/email.client.js';
import {
  renderTemplate,
  buildKycCopyPasteHtml,
  getOperatorContactPublic,
} from '../email/email.templates.js';

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

function operatorEmailVars() {
  return {
    operatorName: process.env.OPERATOR_CONTACT_NAME || '',
    operatorEmail: process.env.OPERATOR_CONTACT_EMAIL || '',
    operatorPhone: process.env.OPERATOR_CONTACT_PHONE || '',
    operatorNote: process.env.OPERATOR_CONTACT_NOTE || '',
  };
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

    const patch = {
      estado: ESTADOS.SIN_VERIFICAR,
      diditSessionId: session.sessionId,
      diditVerificationUrl: session.url,
      notasInternas: notasInternas
        ? appendNota(doc.notasInternas, 'KYC', notasInternas)
        : doc.notasInternas != null
          ? doc.notasInternas
          : null,
      mensajePublico:
        'Tu caso está en atención. Completa la verificación de identidad o contacta al operador si necesitas ayuda.',
    };

    let updated;
    try {
      updated = await repo.update(solicitudId, patch);
    } catch (_e) {
      const fallback = { ...patch };
      delete fallback.diditVerificationUrl;
      updated = await repo.update(solicitudId, fallback);
    }

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
      ...operatorEmailVars(),
    });
    await sendEmail({ to: doc.email, ...tpl });

    return {
      estado: updated.estado,
      sessionId: session.sessionId,
      verificationUrl: session.url,
      emailHtml: tpl.html,
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

      const trackingUrl = publicUrl + '/seguimiento/' + codigo;
      const tpl = renderTemplate(EMAIL_TEMPLATES.TRACKING, {
        nombreFamiliar: input.nombreFamiliar,
        codigo: codigo,
        trackingUrl: trackingUrl,
      });
      await sendEmail({ to: input.email, ...tpl });

      return {
        codigoSeguimiento: codigo,
        trackingUrl: trackingUrl,
        estado: ESTADOS.PENDIENTE,
        id: doc.$id,
      };
    },

    async getByCode({ codigo }) {
      const doc = await repo.findByCodigo(codigo);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);

      const base = {
        codigoSeguimiento: doc.codigoSeguimiento,
        estado: doc.estado,
        mensajePublico: doc.mensajePublico || null,
        fechaCreacion: doc.$createdAt,
        fechaActualizacion: doc.$updatedAt,
        kycCompletado:
          doc.estado === ESTADOS.VERIFICADO || doc.estado === ESTADOS.CERRADO,
      };

      if (doc.estado === ESTADOS.SIN_VERIFICAR) {
        return {
          ...base,
          verificationUrl: doc.diditVerificationUrl || null,
          operatorContact: getOperatorContactPublic(),
        };
      }

      return base;
    },

    async marcarAtendido({ solicitudId, notasInternas, mensajePublico, iniciarKyc, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.SIN_VERIFICAR);

      if (iniciarKyc) {
        const kyc = await startDiditKyc(doc, solicitudId, operatorId, notasInternas);
        return { solicitudId: solicitudId, ...kyc };
      }

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.SIN_VERIFICAR,
        notasInternas: notasInternas
          ? appendNota(doc.notasInternas, 'ATENDIDO', notasInternas)
          : doc.notasInternas != null
            ? doc.notasInternas
            : null,
        mensajePublico:
          mensajePublico ||
          'Tu solicitud está siendo atendida. Pronto recibirás instrucciones de verificación.',
      });

      return {
        solicitudId: solicitudId,
        estado: updated.estado,
        sessionId: null,
        verificationUrl: null,
        emailHtml: null,
      };
    },

    async marcarSinVerificar(args) {
      return this.marcarAtendido({ ...args, iniciarKyc: true });
    },

    async iniciarKyc({ solicitudId, notasInternas, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      if (doc.estado !== ESTADOS.SIN_VERIFICAR && doc.estado !== ESTADOS.PENDIENTE) {
        throw new AppError(
          'INVALID_TRANSITION',
          'Solo se puede iniciar KYC desde pendiente o atendido (sin_verificar)',
        );
      }
      if (doc.estado === ESTADOS.PENDIENTE) {
        assertTransition(doc.estado, ESTADOS.SIN_VERIFICAR);
      }
      const kyc = await startDiditKyc(doc, solicitudId, operatorId, notasInternas);
      return { solicitudId: solicitudId, ...kyc };
    },

    async reenviarKycEmail({ solicitudId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      if (doc.estado !== ESTADOS.SIN_VERIFICAR) {
        throw new AppError('INVALID_TRANSITION', 'Solo disponible en estado sin_verificar');
      }
      if (!doc.diditVerificationUrl) {
        throw new AppError('VALIDATION', 'No hay enlace Didit. Usa «Iniciar KYC» primero.');
      }

      const vars = {
        nombreFamiliar: doc.nombreFamiliar,
        codigo: doc.codigoSeguimiento,
        verificationUrl: doc.diditVerificationUrl,
        ...operatorEmailVars(),
      };
      const tpl = renderTemplate(EMAIL_TEMPLATES.KYC_LINK, vars);
      await sendEmail({ to: doc.email, ...tpl });

      return {
        solicitudId: solicitudId,
        sentTo: doc.email,
        verificationUrl: doc.diditVerificationUrl,
        emailHtml: tpl.html,
      };
    },

    async getKycEmailTemplate({ solicitudId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      if (doc.estado !== ESTADOS.SIN_VERIFICAR) {
        throw new AppError('INVALID_TRANSITION', 'Solo disponible en estado sin_verificar');
      }
      if (!doc.diditVerificationUrl) {
        throw new AppError('VALIDATION', 'No hay enlace Didit. Inicia KYC para generar el enlace.');
      }

      const vars = {
        nombreFamiliar: doc.nombreFamiliar,
        codigo: doc.codigoSeguimiento,
        verificationUrl: doc.diditVerificationUrl,
        ...operatorEmailVars(),
      };

      return {
        solicitudId: solicitudId,
        to: doc.email,
        subject: 'Huella — Verificación de identidad (' + doc.codigoSeguimiento + ')',
        verificationUrl: doc.diditVerificationUrl,
        emailHtml: buildKycCopyPasteHtml(vars),
        operatorContact: getOperatorContactPublic(),
      };
    },

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

      return { solicitudId: solicitudId, estado: updated.estado };
    },

    async list({ estado, limit = 25, offset = 0 } = {}) {
      const { documents, total } = await repo.list({ estado: estado, limit: limit, offset: offset });
      return {
        solicitudes: documents.map(function (doc) {
          return {
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
          };
        }),
        total: total,
        limit: limit,
        offset: offset,
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
        diditVerificationUrl: doc.diditVerificationUrl || null,
        kycResultado: doc.kycResultado || null,
        fechaCreacion: doc.$createdAt,
        fechaActualizacion: doc.$updatedAt,
        operatorContact: getOperatorContactPublic(),
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

      return { solicitudId: solicitudId, estado: updated.estado };
    },

    async cancelar({ solicitudId, motivoInterno, pin, identity }) {
      // import dinámico: no tumba el arranque de solicitudes.list si operadores falla
      const mod = await import('../operadores/operadores.service.js');
      const ops = mod.createOperadoresService(req);
      await ops.assertCancelPin(identity || {}, pin);

      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      assertTransition(doc.estado, ESTADOS.CANCELADA);

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.CANCELADA,
        notasInternas: appendNota(
          doc.notasInternas,
          'CANCELADA',
          motivoInterno + ' (PIN OK · user ' + (identity && identity.userId ? identity.userId : 'n/a') + ')',
        ),
        mensajePublico: 'Esta solicitud ha sido cancelada.',
      });

      return { solicitudId: solicitudId, estado: updated.estado };
    },
  };
}

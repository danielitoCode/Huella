import { AppError } from '../../shared/errors.js';
import { ESTADOS, EMAIL_TEMPLATES } from '../../shared/constants.js';
import { generarCodigoSeguimiento } from '../../shared/codigo.js';
import { createSolicitudesRepo, createKycRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import { createDiditSession } from '../../infrastructure/didit/didit.client.js';
import { sendEmail } from '../../infrastructure/email/email.client.js';
import { renderTemplate } from '../email/email.templates.js';

export function createSolicitudesService(req) {
  const repo = createSolicitudesRepo(req);
  const kycRepo = createKycRepo(req);
  const publicUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

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

    async marcarSinVerificar({ solicitudId, notasInternas, mensajePublico, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);
      if (doc.estado !== ESTADOS.PENDIENTE) {
        throw new AppError(
          'INVALID_TRANSITION',
          `No se puede pasar a sin_verificar desde "${doc.estado}"`,
        );
      }

      const session = await createDiditSession({
        vendorData: doc.$id,
        callbackUrl: process.env.DIDIT_CALLBACK_URL,
      });

      const updated = await repo.update(solicitudId, {
        estado: ESTADOS.SIN_VERIFICAR,
        diditSessionId: session.sessionId,
        notasInternas: notasInternas ?? doc.notasInternas ?? null,
        mensajePublico:
          mensajePublico ||
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
        solicitudId,
        estado: updated.estado,
        sessionId: session.sessionId,
        verificationUrl: session.url,
      };
    },
  };
}

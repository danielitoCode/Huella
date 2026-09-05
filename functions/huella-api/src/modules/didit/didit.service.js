import { AppError } from '../../shared/errors.js';
import { ESTADOS } from '../../shared/constants.js';
import { createSolicitudesRepo, createKycRepo } from '../../infrastructure/appwrite/appwrite.database.js';
import { createDiditSession } from '../../infrastructure/didit/didit.client.js';

export function createDiditService(req) {
  const repo = createSolicitudesRepo(req);
  const kycRepo = createKycRepo(req);

  return {
    async createSession({ solicitudId, operatorId }) {
      const doc = await repo.getById(solicitudId);
      if (!doc) throw new AppError('NOT_FOUND', 'Solicitud no encontrada', 404);

      if (doc.estado === ESTADOS.CERRADO || doc.estado === ESTADOS.VERIFICADO) {
        throw new AppError('INVALID_STATE', `Estado "${doc.estado}" no admite nueva sesión KYC`);
      }

      const session = await createDiditSession({
        vendorData: doc.$id,
        callbackUrl: process.env.DIDIT_CALLBACK_URL,
      });

      const patch = { diditSessionId: session.sessionId };
      if (doc.estado === ESTADOS.PENDIENTE) {
        patch.estado = ESTADOS.SIN_VERIFICAR;
        patch.mensajePublico =
          'Te enviamos un enlace para verificar tu identidad. Revisa tu correo.';
      }
      await repo.update(solicitudId, patch);

      await kycRepo.create({
        solicitud_id: solicitudId,
        user_id: operatorId || null,
        didit_session_id: session.sessionId,
        status: 'Not Started',
        codigo_seguimiento: doc.codigoSeguimiento,
      });

      return { sessionId: session.sessionId, url: session.url };
    },
  };
}

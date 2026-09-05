import { AppError } from '../../shared/errors.js';
import { verifyDiditSignatureV2 } from './didit.signature.js';
import { mapDiditStatus } from './didit.mapper.js';
import { createRepos } from '../../infrastructure/appwrite/appwrite.database.js';
import { DIDIT_STATUSES } from './didit.types.js';

function header(req, name) {
  const h = req.headers || {};
  return h[name] || h[name.toLowerCase()] || h[name.toUpperCase()];
}

export async function handleDiditWebhook(req, log) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) throw new AppError('CONFIG_ERROR', 'DIDIT_WEBHOOK_SECRET missing', 500);

  const rawBody =
    req.bodyText ||
    (typeof req.body === 'string' ? req.body : JSON.stringify(req.bodyJson || req.body || {}));

  let bodyJson = req.bodyJson;
  if (!bodyJson) {
    try {
      bodyJson = JSON.parse(rawBody);
    } catch {
      throw new AppError('INVALID_BODY', 'Body JSON inválido', 400);
    }
  }

  const signatureV2 = header(req, 'x-signature-v2') || header(req, 'X-Signature-V2');
  const timestamp = header(req, 'x-timestamp') || header(req, 'X-Timestamp');

  const valid = verifyDiditSignatureV2({
    rawBody,
    bodyJson,
    signatureV2,
    timestamp,
    secret,
  });
  if (!valid) {
    throw new AppError('INVALID_SIGNATURE', 'Firma o timestamp inválidos', 401);
  }

  const sessionId =
    bodyJson.session_id || bodyJson.sessionId || bodyJson.data?.session_id;
  const status = bodyJson.status || bodyJson.data?.status;
  const eventId =
    bodyJson.event_id ||
    bodyJson.eventId ||
    bodyJson.webhook_id ||
    `${sessionId}:${status}:${bodyJson.timestamp || timestamp}`;
  const vendorData =
    bodyJson.vendor_data || bodyJson.vendorData || bodyJson.data?.vendor_data;

  if (!sessionId) throw new AppError('VALIDATION', 'session_id ausente', 400);
  if (!status) throw new AppError('VALIDATION', 'status ausente', 400);

  if (!DIDIT_STATUSES.includes(status)) {
    log?.(`Didit status no catalogado (se procesa igual): ${status}`);
  }

  const repos = createRepos(req);

  if (await repos.eventExists(eventId)) {
    return { duplicate: true, eventId };
  }
  const saved = await repos.saveEvent(eventId, 'didit');
  if (!saved) {
    return { duplicate: true, eventId };
  }

  const mapped = mapDiditStatus(status);

  let solicitud =
    (await repos.findSolicitudByDiditSession(sessionId)) ||
    (vendorData ? await repos.findSolicitudById(String(vendorData)) : null);

  if (!solicitud) {
    log?.(`Solicitud no encontrada para session ${sessionId}`);
    return { processed: true, warning: 'solicitud_not_found', sessionId, status };
  }

  let kyc = await repos.findKycBySession(sessionId);
  const kycPatch = {
    status: mapped.kycStatus,
    didit_session_id: sessionId,
    solicitud_id: solicitud.$id,
  };
  if (status === 'Approved') {
    kycPatch.verified_at = new Date().toISOString();
  }
  if (kyc) {
    await repos.updateKyc(kyc.$id, kycPatch);
  } else {
    await repos.createKyc({
      ...kycPatch,
      codigo_seguimiento: solicitud.codigoSeguimiento,
      user_id: null,
    });
  }

  const solicitudPatch = {};
  if (mapped.kycResultado) {
    solicitudPatch.kycResultado = mapped.kycResultado;
  }
  if (mapped.solicitudEstado === 'verificado' && solicitud.estado === 'sin_verificar') {
    solicitudPatch.estado = 'verificado';
    if (mapped.mensajePublico) solicitudPatch.mensajePublico = mapped.mensajePublico;
  }

  if (Object.keys(solicitudPatch).length) {
    await repos.updateSolicitud(solicitud.$id, solicitudPatch);
  }

  return {
    processed: true,
    eventId,
    sessionId,
    status,
    solicitudId: solicitud.$id,
    estado: solicitudPatch.estado || solicitud.estado,
  };
}

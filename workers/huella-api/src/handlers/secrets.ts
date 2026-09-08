/**
 * Acciones con secretos / tracking público.
 * Auth operador: mismo patrón JWT de list_users.
 */
import { Client, Databases, Query } from 'node-appwrite';
import type { Env } from '../env';
import { dbIds } from '../env';
import {
  createAppwriteUsersGateway,
  getAppwriteConfig,
} from '../infrastructure/usersGateway';
import { isOperadorByLabels } from '../domain/adminPolicy';
import { isDefaultPinHash, verifyPin } from '../pin';

function extractJwt(req: Request, payload: Record<string, unknown>): string | null {
  const h =
    req.headers.get('x-appwrite-user-jwt') ||
    req.headers.get('x-appwrite-jwt') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (h) return h;
  const fromBody = payload.requesterJwt || payload.jwt || null;
  return fromBody ? String(fromBody) : null;
}

async function requireOperador(req: Request, payload: Record<string, unknown>, env: Env) {
  const config = getAppwriteConfig(env);
  const gateway = createAppwriteUsersGateway(config);
  const jwt = extractJwt(req, payload);
  const { requesterId, requester } = await gateway.getRequester({ requesterJwt: jwt });
  if (!requesterId || !requester) {
    throw Object.assign(new Error('No autorizado. Inicie sesión.'), {
      code: 'UNAUTHORIZED',
      status: 401,
    });
  }
  if (!isOperadorByLabels(requester.labels)) {
    throw Object.assign(new Error('Se requiere operador/admin'), {
      code: 'FORBIDDEN',
      status: 403,
    });
  }
  return { requesterId, requester, gateway, config };
}

export async function handleSecrets(
  action: string,
  payload: Record<string, unknown>,
  req: Request,
  env: Env,
) {
  const ids = dbIds(env);
  const salt = env.PIN_SALT || 'huella';

  if (action === 'solicitudes.getByCode') {
    const config = getAppwriteConfig(env);
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);
    const databases = new Databases(client);

    const code = String(payload.codigoSeguimiento || payload.code || '')
      .trim()
      .toUpperCase();
    if (!code) {
      throw Object.assign(new Error('Código requerido'), { code: 'VALIDATION', status: 400 });
    }
    const res = await databases.listDocuments(ids.databaseId, ids.solicitudes, [
      Query.equal('codigoSeguimiento', code),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    if (!doc) {
      throw Object.assign(new Error('Solicitud no encontrada'), {
        code: 'NOT_FOUND',
        status: 404,
      });
    }
    return {
      id: doc.$id,
      codigoSeguimiento: doc.codigoSeguimiento,
      estado: doc.estado,
      nombreFamiliar: doc.nombreFamiliar,
      nombrePersona: doc.nombrePersona,
      mensajePublico: doc.mensajePublico || null,
      diditSessionId: doc.diditSessionId || null,
      verificationUrl: doc.verificationUrl || null,
      fechaCreacion: doc.$createdAt,
      fechaActualizacion: doc.$updatedAt,
      operatorContact: {
        name: env.OPERATOR_CONTACT_NAME || 'Equipo Huella',
        email: env.OPERATOR_CONTACT_EMAIL || null,
        phone: env.OPERATOR_CONTACT_PHONE || null,
        note: env.OPERATOR_CONTACT_NOTE || null,
      },
    };
  }

  if (action === 'solicitudes.cancelar') {
    const { requesterId, config } = await requireOperador(req, payload, env);
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);
    const databases = new Databases(client);

    const solicitudId = String(payload.solicitudId || '');
    const pin = String(payload.pin || '').trim();
    const motivo = String(payload.motivo || '').trim();

    const opList = await databases.listDocuments(ids.databaseId, ids.operadores, [
      Query.equal('userId', requesterId),
      Query.limit(1),
    ]);
    const op = opList.documents[0] as unknown as Record<string, unknown> | undefined;
    if (!op) {
      throw Object.assign(new Error('Sin perfil operador'), { code: 'FORBIDDEN', status: 403 });
    }
    if (await isDefaultPinHash(op.cancelPinHash as string, salt)) {
      throw Object.assign(
        new Error('Debes establecer un PIN personal antes de cancelar (ahora es 0000).'),
        { code: 'PIN_RESET_REQUIRED', status: 403 },
      );
    }
    if (!(await verifyPin(pin, op.cancelPinHash as string, salt))) {
      throw Object.assign(new Error('PIN de cancelación incorrecto'), {
        code: 'FORBIDDEN',
        status: 403,
      });
    }

    const updated = await databases.updateDocument(ids.databaseId, ids.solicitudes, solicitudId, {
      estado: 'cancelada',
      motivoCierre: motivo || 'Cancelada por operador',
    });
    return { id: updated.$id, estado: updated.estado, motivoCierre: updated.motivoCierre };
  }

  if (action === 'didit.createSession') {
    await requireOperador(req, payload, env);
    const apiKey = env.DIDIT_API_KEY;
    const workflowId = env.DIDIT_WORKFLOW_ID;
    if (!apiKey || !workflowId) {
      throw Object.assign(new Error('Didit no configurado'), { code: 'CONFIG', status: 500 });
    }
    const config = getAppwriteConfig(env);
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);
    const databases = new Databases(client);

    const solicitudId = String(payload.solicitudId || '');
    const callback =
      String(payload.callbackUrl || '') ||
      `${(env.PUBLIC_APP_URL || '').replace(/\/$/, '')}/seguimiento`;

    const res = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        callback_url: callback,
        metadata: { solicitudId },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw Object.assign(new Error(String(data.message || 'Didit error')), {
        code: 'DIDIT',
        status: 502,
      });
    }

    const sessionId = String(data.session_id || data.id || '');
    const verificationUrl = String(data.url || data.verification_url || '');

    if (solicitudId) {
      await databases.updateDocument(ids.databaseId, ids.solicitudes, solicitudId, {
        diditSessionId: sessionId,
        verificationUrl,
        estado: 'sin_verificar',
      });
    }

    return { sessionId, verificationUrl, diditSessionId: sessionId };
  }

  if (action === 'email.send') {
    await requireOperador(req, payload, env);
    const to = String(payload.to || '');
    const subject = String(payload.subject || 'Huella');
    const html = String(payload.html || payload.body || '');
    if (!env.RESEND_API_KEY) {
      throw Object.assign(new Error('Email no configurado'), { code: 'CONFIG', status: 500 });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'Huella <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw Object.assign(new Error(t || 'Error enviando email'), { code: 'EMAIL', status: 502 });
    }
    return { sent: true };
  }

  throw Object.assign(new Error(`Acción desconocida: ${action}`), {
    code: 'INVALID_ACTION',
    status: 400,
  });
}

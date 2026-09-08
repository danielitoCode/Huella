/**
 * Acciones que SÍ deben quedarse en Worker (secretos / tracking público).
 * CRUD de solicitudes del backoffice → SDK Appwrite en el cliente.
 */
import type { Env } from '../env';
import type { Identity } from '../auth';
import { assertOperador } from '../auth';
import { adminClient } from '../appwrite';
import { Query } from 'node-appwrite';
import { isDefaultPinHash, verifyPin } from '../pin';

export async function handleSecrets(
  action: string,
  payload: Record<string, unknown>,
  identity: Identity,
  env: Env,
) {
  const { databases, ids } = adminClient(env);
  const salt = env.PIN_SALT || 'huella';

  // Seguimiento público por código (permisos Appwrite no modelan bien “quien conoce el código”)
  if (action === 'solicitudes.getByCode') {
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
      throw Object.assign(new Error('Solicitud no encontrada'), { code: 'NOT_FOUND', status: 404 });
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
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
      operatorContact: {
        name: env.OPERATOR_CONTACT_NAME || 'Equipo Huella',
        email: env.OPERATOR_CONTACT_EMAIL || null,
        phone: env.OPERATOR_CONTACT_PHONE || null,
        note: env.OPERATOR_CONTACT_NOTE || null,
      },
    };
  }

  // Cancelar con PIN (hash solo en servidor)
  if (action === 'solicitudes.cancelar') {
    assertOperador(identity);
    const solicitudId = String(payload.solicitudId || '');
    const pin = String(payload.pin || '').trim();
    const motivo = String(payload.motivo || '').trim();

    if (identity.pinNeedsReset) {
      throw Object.assign(
        new Error('Debes establecer un PIN personal antes de cancelar (ahora es 0000).'),
        { code: 'PIN_RESET_REQUIRED', status: 403 },
      );
    }
    if (!identity.operadorDocId) {
      throw Object.assign(new Error('Sin perfil operador'), { code: 'FORBIDDEN', status: 403 });
    }
    const op = (await databases.getDocument(
      ids.databaseId,
      ids.operadores,
      identity.operadorDocId,
    )) as unknown as Record<string, unknown>;
    if (!(await verifyPin(pin, op.cancelPinHash as string, salt))) {
      throw Object.assign(new Error('PIN de cancelación incorrecto'), {
        code: 'FORBIDDEN',
        status: 403,
      });
    }
    if (await isDefaultPinHash(op.cancelPinHash as string, salt)) {
      throw Object.assign(new Error('PIN reseteado; establece uno nuevo'), {
        code: 'PIN_RESET_REQUIRED',
        status: 403,
      });
    }

    const updated = await databases.updateDocument(ids.databaseId, ids.solicitudes, solicitudId, {
      estado: 'cancelada',
      motivoCierre: motivo || 'Cancelada por operador',
    });
    return {
      id: updated.$id,
      estado: updated.estado,
      motivoCierre: updated.motivoCierre,
    };
  }

  // Didit session (API key)
  if (action === 'didit.createSession') {
    assertOperador(identity);
    const apiKey = env.DIDIT_API_KEY;
    const workflowId = env.DIDIT_WORKFLOW_ID;
    if (!apiKey || !workflowId) {
      throw Object.assign(new Error('Didit no configurado'), { code: 'CONFIG', status: 500 });
    }
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

  // Email genérico (Resend)
  if (action === 'email.send') {
    assertOperador(identity);
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

  // Listado de solicitudes (backoffice)
  if (action === 'solicitudes.list') {
    assertOperador(identity);
    const estado = String(payload.estado || '').trim() || undefined;
    const limit = Number(payload.limit ?? 25) || 25;
    const offset = Number(payload.offset ?? 0) || 0;
    const filters = [];
    if (estado) filters.push(Query.equal('estado', estado));
    filters.push(Query.orderDesc('$createdAt'));
    filters.push(Query.limit(limit));
    filters.push(Query.offset(offset));
    const res = await databases.listDocuments(ids.databaseId, ids.solicitudes, filters);
    const solicitudes = (res.documents || []).map((doc) => ({
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
    }));
    return { solicitudes, total: res.total || 0, limit, offset };
  }

  throw Object.assign(new Error(`Acción desconocida: ${action}`), {
    code: 'INVALID_ACTION',
    status: 400,
  });
}

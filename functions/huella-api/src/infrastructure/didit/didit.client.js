import { AppError } from '../../shared/errors.js';

const DIDIT_BASE = process.env.DIDIT_API_BASE || 'https://verification.didit.me';

export async function createDiditSession({ vendorData, callbackUrl }) {
  const apiKey = process.env.DIDIT_API_KEY;
  const workflowId = process.env.DIDIT_WORKFLOW_ID;
  if (!apiKey || !workflowId) {
    throw new AppError('CONFIG_ERROR', 'Didit no configurado', 500);
  }

  const body = {
    workflow_id: workflowId,
    vendor_data: vendorData,
  };
  if (callbackUrl) body.callback = callbackUrl;

  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new AppError('DIDIT_ERROR', `Didit respondió ${res.status}`, 502);
  }

  const data = await res.json();
  const sessionId = data.session_id || data.id || data.sessionId;
  const url =
    data.url ||
    data.verification_url ||
    data.session_url ||
    data.verificationUrl;

  if (!sessionId || !url) {
    throw new AppError('DIDIT_ERROR', 'Respuesta Didit incompleta', 502);
  }

  return { sessionId, url };
}

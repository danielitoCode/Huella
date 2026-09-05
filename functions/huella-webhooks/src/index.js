import { dispatchWebhook } from './router/routes.js';
import { toClientError } from './shared/errors.js';
import { ok } from './shared/response.js';

/**
 * Appwrite Function — huella-webhooks
 * POST /webhooks/didit
 */
export default async ({ req, res, log, error }) => {
  if (req.method === 'GET') {
    return res.json({
      success: true,
      data: { service: 'huella-webhooks', providers: ['didit'] },
    });
  }

  if (req.method !== 'POST') {
    return res.json(
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
      405,
    );
  }

  try {
    const data = await dispatchWebhook(req, log);
    return res.json(ok(data));
  } catch (err) {
    const { status, body } = toClientError(err, error || log);
    return res.json(body, status);
  }
};

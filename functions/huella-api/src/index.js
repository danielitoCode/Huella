import { dispatch } from './router/router.js';
import { handleError } from './middleware/error-handler.js';

/**
 * Appwrite Function entrypoint — huella-api
 * Body: { "action": "solicitudes.create", "payload": { ... } }
 */
export default async ({ req, res, log, error }) => {
  if (req.method === 'GET') {
    return res.json({
      success: true,
      data: {
        service: 'huella-api',
        version: '1.0.0',
        hint: 'POST { action, payload }',
      },
    });
  }

  if (req.method !== 'POST') {
    return res.json(
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } },
      405,
    );
  }

  try {
    const body = await dispatch(req, log);
    return res.json(body);
  } catch (err) {
    const { status, body } = handleError(err, error || log);
    return res.json(body, status);
  }
};

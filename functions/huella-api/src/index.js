/**
 * Appwrite Function entrypoint — huella-api
 * Body: { "action": "solicitudes.create", "payload": { ... } }
 */
export default async function (context) {
  const req = context.req;
  const res = context.res;
  const log = context.log;
  const error = context.error;

  try {
    const { dispatch } = await import('./router/router.js');
    const { handleError } = await import('./middleware/error-handler.js');

    if (req.method === 'GET') {
      return res.json({
        success: true,
        data: {
          service: 'huella-api',
          version: '1.1.1',
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

    const body = await dispatch(req, log);
    return res.json(body);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const stack = err && err.stack ? err.stack : '';
    try {
      if (typeof error === 'function') error(msg + '\n' + stack);
      else if (typeof log === 'function') log('ERR ' + msg + '\n' + stack);
    } catch (_e) {
      // ignore
    }

    try {
      const { handleError } = await import('./middleware/error-handler.js');
      const result = handleError(err, error || log);
      return res.json(result.body, result.status);
    } catch (_e2) {
      return res.json(
        {
          success: false,
          error: { code: 'INTERNAL', message: msg },
        },
        500,
      );
    }
  }
}

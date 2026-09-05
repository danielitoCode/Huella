export class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function toClientError(err, log) {
  if (err instanceof AppError) {
    return { status: err.status, body: { success: false, error: { code: err.code, message: err.message } } };
  }
  if (log) log(String(err?.stack || err));
  return { status: 500, body: { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } } };
}

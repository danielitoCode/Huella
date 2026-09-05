import { AppError } from '../../shared/errors.js';

export function validateCreateSession(payload = {}) {
  const solicitudId = String(payload.solicitudId || '').trim();
  if (!solicitudId) throw new AppError('VALIDATION', 'solicitudId requerido');
  return { solicitudId };
}

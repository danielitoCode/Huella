import { AppError } from '../../shared/errors.js';
import { EMAIL_TEMPLATES } from '../../shared/constants.js';

const allowed = new Set(Object.values(EMAIL_TEMPLATES));

export function validateSend(payload = {}) {
  const to = String(payload.to || '').trim().toLowerCase();
  if (!to || !to.includes('@')) throw new AppError('VALIDATION', 'to inválido');

  const template = payload.template ? String(payload.template) : null;
  if (template && !allowed.has(template)) {
    throw new AppError('VALIDATION', `template desconocido: ${template}`);
  }
  if (!template && !payload.subject) {
    throw new AppError('VALIDATION', 'template o subject requerido');
  }

  return {
    to,
    template,
    subject: payload.subject,
    vars: payload.vars || {},
    text: payload.text,
    html: payload.html,
  };
}

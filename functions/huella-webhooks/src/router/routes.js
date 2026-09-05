import { handleDiditWebhook } from '../providers/didit/didit.webhook.js';
import { AppError } from '../shared/errors.js';

export const providers = {
  didit: handleDiditWebhook,
  // stripe: handleStripeWebhook,
};

export function resolveProvider(req) {
  const path = String(req.path || req.url || '');
  const match = path.match(/\/webhooks\/([a-z0-9_-]+)/i);
  if (match) return match[1].toLowerCase();

  const q = req.query || {};
  if (q.provider) return String(q.provider).toLowerCase();

  const h = req.headers || {};
  if (h['x-webhook-provider']) return String(h['x-webhook-provider']).toLowerCase();

  return 'didit';
}

export async function dispatchWebhook(req, log) {
  const name = resolveProvider(req);
  const handler = providers[name];
  if (!handler) {
    throw new AppError('UNKNOWN_PROVIDER', `Provider no soportado: ${name}`, 404);
  }
  return handler(req, log);
}

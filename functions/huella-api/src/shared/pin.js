import { createHash, timingSafeEqual } from 'node:crypto';

function salt() {
  return process.env.PIN_SALT || process.env.APPWRITE_PROJECT_ID || 'huella-pin';
}

/** Hash de PIN de 4 dígitos (no reversible). */
export function hashPin(pin) {
  return createHash('sha256').update(`${salt()}:${String(pin).trim()}`, 'utf8').digest('hex');
}

export function verifyPin(pin, storedHash) {
  if (!pin || !storedHash) return false;
  const a = Buffer.from(hashPin(pin), 'utf8');
  const b = Buffer.from(String(storedHash), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Fallback global (bootstrap) desde env BACKOFFICE_CANCEL_PIN. */
export function verifyGlobalCancelPin(pin) {
  const expected = String(process.env.BACKOFFICE_CANCEL_PIN || '').trim();
  if (!expected || !/^\d{4}$/.test(expected)) return false;
  return expected === String(pin).trim();
}

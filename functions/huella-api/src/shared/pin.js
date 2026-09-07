import { createHash, timingSafeEqual } from 'node:crypto';

/** PIN de fábrica tras reset administrativo. */
export const DEFAULT_CANCEL_PIN = '0000';

/** Contraseña de fábrica tras reset administrativo. */
export const DEFAULT_PASSWORD = '12345678';

function salt() {
  return process.env.PIN_SALT || process.env.APPWRITE_PROJECT_ID || 'huella-pin';
}

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

export function isDefaultPinHash(storedHash) {
  if (!storedHash) return true;
  return verifyPin(DEFAULT_CANCEL_PIN, storedHash);
}

const DEFAULT_PIN = '0000';

export function defaultPin() {
  return DEFAULT_PIN;
}

export function defaultPassword() {
  return '12345678';
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${String(pin).trim()}`);
}

export async function verifyPin(pin: string, hash: string | null | undefined, salt: string) {
  if (!hash) return false;
  const h = await hashPin(pin, salt);
  return h === hash;
}

export async function isDefaultPinHash(hash: string | null | undefined, salt: string) {
  if (!hash) return true;
  return verifyPin(DEFAULT_PIN, hash, salt);
}

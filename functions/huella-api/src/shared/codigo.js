const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generarCodigoSeguimiento(now = new Date()) {
  const year = now.getUTCFullYear();
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `HUE-${year}-${suffix}`;
}

export function esCodigoValido(codigo) {
  return /^HUE-\d{4}-[A-Z2-9]{6}$/.test(String(codigo || '').trim().toUpperCase());
}

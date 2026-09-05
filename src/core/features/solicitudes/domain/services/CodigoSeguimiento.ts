/** Generación de códigos HUE-YYYY-XXXXXX sin caracteres ambiguos */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generarCodigoSeguimiento(
  now: Date = new Date(),
  random: () => number = Math.random,
): string {
  const year = now.getUTCFullYear();
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return `HUE-${year}-${suffix}`;
}

export function esCodigoSeguimientoValido(codigo: string): boolean {
  return /^HUE-\d{4}-[A-Z2-9]{6}$/.test(codigo);
}

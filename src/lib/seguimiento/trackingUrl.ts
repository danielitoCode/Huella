import { getPublicConfig } from '../appwrite/client';

/** URL pública de seguimiento para un código (compartible / imprimible). */
export function buildTrackingUrl(codigo: string): string {
  const base =
    getPublicConfig().publicAppUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const code = codigo.trim().toUpperCase();
  return `${base.replace(/\/$/, '')}/seguimiento/${encodeURIComponent(code)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

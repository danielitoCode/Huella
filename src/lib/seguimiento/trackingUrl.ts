/** URL de seguimiento público (sin Appwrite). */
export function getTrackingUrl(codigo: string): string {
  const base =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL) ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const code = encodeURIComponent(codigo.trim().toUpperCase());
  return `${String(base).replace(/\/$/, '')}/?ruta=seguimiento&codigo=${code}`;
}

export function getPublicAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL) {
    return String(import.meta.env.VITE_PUBLIC_APP_URL).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

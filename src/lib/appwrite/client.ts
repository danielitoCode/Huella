/**
 * SHIM: antes cliente Appwrite. Solo helpers de URL pública para tracking.
 */
export function getPublicConfig(): { publicAppUrl: string } {
  const publicAppUrl =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_PUBLIC_APP_URL as string | undefined)) ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return { publicAppUrl: String(publicAppUrl || '').replace(/\/$/, '') };
}

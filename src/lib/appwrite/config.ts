/**
 * Config pública:
 * - Appwrite Auth + DB (SDK)
 * - VITE_API_BASE_URL → Cloudflare Worker huella-api (secretos)
 */
export type AppwritePublicConfig = {
  endpoint: string;
  projectId: string;
  databaseId: string;
  collectionSolicitudesId: string;
  apiBaseUrl: string;
  functionApiId: string;
  publicAppUrl: string;
  devKey?: string;
};

function required(name: string, value: string | undefined): string {
  const v = (value ?? '').trim();
  if (!v) {
    throw new Error(`Falta variable de entorno ${name}.`);
  }
  return v;
}

export function getAppwriteConfig(): AppwritePublicConfig {
  const endpoint = required('VITE_APPWRITE_ENDPOINT', import.meta.env.VITE_APPWRITE_ENDPOINT);
  const projectId = required('VITE_APPWRITE_PROJECT_ID', import.meta.env.VITE_APPWRITE_PROJECT_ID);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
  const functionApiId = (import.meta.env.VITE_APPWRITE_FUNCTION_API_ID ?? '').trim();

  if (!apiBaseUrl && !functionApiId) {
    throw new Error('Configura VITE_API_BASE_URL (Cloudflare Worker huella-api).');
  }

  return {
    endpoint,
    projectId,
    databaseId: (import.meta.env.VITE_APPWRITE_DATABASE_ID ?? 'huella').trim() || 'huella',
    collectionSolicitudesId:
      (import.meta.env.VITE_APPWRITE_COLLECTION_SOLICITUDES_ID ?? 'solicitudes').trim() ||
      'solicitudes',
    apiBaseUrl,
    functionApiId,
    publicAppUrl:
      (import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim() ||
      (typeof window !== 'undefined' ? window.location.origin : ''),
    devKey: (import.meta.env.VITE_APPWRITE_DEV_KEY ?? '').trim() || undefined,
  };
}

export function isAppwriteConfigured(): boolean {
  try {
    getAppwriteConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Configuración pública del cliente Appwrite (solo VITE_*).
 * No incluye secretos de servidor.
 */
export type AppwritePublicConfig = {
  endpoint: string;
  projectId: string;
  databaseId: string;
  collectionSolicitudesId: string;
  functionApiId: string;
  publicAppUrl: string;
  devKey?: string;
};

function required(name: keyof ImportMetaEnv, value: string | undefined): string {
  const v = (value ?? '').trim();
  if (!v) {
    throw new Error(
      `Falta variable de entorno ${String(name)}. Copia .env.example → .env y rellena los valores de Appwrite.`,
    );
  }
  return v;
}

/**
 * Lee config desde import.meta.env.
 * Lanza si faltan endpoint, project o function id (necesarios para executeApi).
 */
export function getAppwriteConfig(): AppwritePublicConfig {
  const endpoint = required('VITE_APPWRITE_ENDPOINT', import.meta.env.VITE_APPWRITE_ENDPOINT);
  const projectId = required('VITE_APPWRITE_PROJECT_ID', import.meta.env.VITE_APPWRITE_PROJECT_ID);
  const functionApiId = required(
    'VITE_APPWRITE_FUNCTION_API_ID',
    import.meta.env.VITE_APPWRITE_FUNCTION_API_ID,
  );

  return {
    endpoint,
    projectId,
    databaseId: (import.meta.env.VITE_APPWRITE_DATABASE_ID ?? 'huella').trim() || 'huella',
    collectionSolicitudesId:
      (import.meta.env.VITE_APPWRITE_COLLECTION_SOLICITUDES_ID ?? 'solicitudes').trim() ||
      'solicitudes',
    functionApiId,
    publicAppUrl:
      (import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim() ||
      (typeof window !== 'undefined' ? window.location.origin : ''),
    devKey: (import.meta.env.VITE_APPWRITE_DEV_KEY ?? '').trim() || undefined,
  };
}

/** Comprueba si la config mínima está presente sin lanzar. */
export function isAppwriteConfigured(): boolean {
  try {
    getAppwriteConfig();
    return true;
  } catch {
    return false;
  }
}

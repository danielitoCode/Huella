/**
 * Config pública (solo VITE_*):
 * - Appwrite Auth + Databases vía Client SDK
 * - Worker/Function son opcionales (congelados para solicitudes/seguimiento)
 */
export type AppwritePublicConfig = {
  endpoint: string;
  projectId: string;
  databaseId: string;
  collectionSolicitudesId: string;
  collectionAuditoriaId: string;
  /** Opcional: Worker (Didit/email/PIN). Vacío = solo SDK. */
  apiBaseUrl: string;
  functionApiId: string;
  publicAppUrl: string;
  operatorContactName: string;
  operatorContactEmail: string;
  operatorContactPhone: string;
  operatorContactNote: string;
  devKey?: string;
};

function required(name: string, value: string | undefined): string {
  const v = (value ?? '').trim();
  if (!v) {
    throw new Error(`Falta variable de entorno ${name}.`);
  }
  return v;
}

/** Primera variable VITE_* no vacía (soporta alias de nombres). */
function firstEnv(...names: string[]): string {
  for (const name of names) {
    const v = (import.meta.env[name] as string | undefined)?.trim();
    if (v) return v;
  }
  return '';
}

export function getAppwriteConfig(): AppwritePublicConfig {
  const endpoint = required('VITE_APPWRITE_ENDPOINT', import.meta.env.VITE_APPWRITE_ENDPOINT);
  const projectId = required('VITE_APPWRITE_PROJECT_ID', import.meta.env.VITE_APPWRITE_PROJECT_ID);

  const collectionAuditoriaId =
    firstEnv('VITE_APPWRITE_COLLECTION_AUDITORIA', 'VITE_APPWRITE_COLLECTION_AUDITORIA_ID') ||
    'auditoria';

  const collectionSolicitudesId =
    firstEnv(
      'VITE_APPWRITE_COLLECTION_SOLICITUDES',
      'VITE_APPWRITE_COLLECTION_SOLICITUDES_ID',
    ) || 'solicitudes';

  return {
    endpoint,
    projectId,
    databaseId:
      firstEnv('VITE_APPWRITE_DATABASE_ID', 'VITE_APPWRITE_DATABASE') || 'huella',
    collectionSolicitudesId,
    collectionAuditoriaId,
    apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
    functionApiId: (import.meta.env.VITE_APPWRITE_FUNCTION_API_ID ?? '').trim(),
    publicAppUrl:
      (import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim() ||
      (typeof window !== 'undefined' ? window.location.origin : ''),
    operatorContactName: (import.meta.env.VITE_OPERATOR_CONTACT_NAME ?? 'Equipo Huella').trim(),
    operatorContactEmail: (import.meta.env.VITE_OPERATOR_CONTACT_EMAIL ?? '').trim(),
    operatorContactPhone: (import.meta.env.VITE_OPERATOR_CONTACT_PHONE ?? '').trim(),
    operatorContactNote: (
      import.meta.env.VITE_OPERATOR_CONTACT_NOTE ??
      'Si no puedes completar la verificación digital, contacta al equipo para una vía asistida.'
    ).trim(),
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

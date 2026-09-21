/**
 * SHIM: getAppwriteConfig → datos de Supabase para DevLoggerPanel legado.
 */
import { getSupabaseConfig } from '../supabase/config';

export function getAppwriteConfig(): {
  endpoint: string;
  projectId: string;
  functionApiId: string;
} {
  try {
    const c = getSupabaseConfig();
    return {
      endpoint: c.url,
      projectId: '(supabase)',
      functionApiId: '(n/a — client directo)',
    };
  } catch {
    return {
      endpoint: '(sin VITE_SUPABASE_URL)',
      projectId: '',
      functionApiId: '',
    };
  }
}

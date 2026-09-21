/**
 * BLOQUE: Cliente Supabase singleton (browser).
 * Propósito: una sola instancia de createClient para Auth + PostgREST + Realtime.
 * Filosofía migración: Client → Supabase directo; sin API intermedia para auth.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

let clientSingleton: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (clientSingleton) return clientSingleton;

  const { url, anonKey } = getSupabaseConfig();
  clientSingleton = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return clientSingleton;
}

/** Solo tests: reinicia el singleton. */
export function __resetSupabaseClientForTests(): void {
  clientSingleton = null;
}

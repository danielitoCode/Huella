/**
 * BLOQUE: Barrel público de infraestructura Supabase.
 */
export { getSupabase, __resetSupabaseClientForTests } from './client';
export { getSupabaseConfig, isSupabaseConfigured, type SupabasePublicConfig } from './config';

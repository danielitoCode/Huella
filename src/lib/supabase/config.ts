/**
 * BLOQUE: Configuración pública de Supabase (solo claves publishable/anon).
 * Propósito: centralizar URL y anon key leídas de VITE_* para el cliente browser.
 * Seguridad: nunca incluir service_role aquí; solo anon/publishable.
 */

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function required(name: string, value: string | undefined): string {
  const v = (value ?? '').trim();
  if (!v) {
    throw new Error(`Falta variable de entorno ${name}.`);
  }
  return v;
}

export function getSupabaseConfig(): SupabasePublicConfig {
  // Alias: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (estándar)
  // también aceptamos VITE_SUPABASE_PUBLISHABLE_KEY por si el dashboard lo nombra así.
  const url = required(
    'VITE_SUPABASE_URL',
    import.meta.env.VITE_SUPABASE_URL as string | undefined,
  );
  const anonKey = required(
    'VITE_SUPABASE_ANON_KEY',
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined),
  );

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

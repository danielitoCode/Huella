/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase (migración MVP) — URL del proyecto */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon / publishable key (nunca service_role) */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;

  /** Appwrite (legacy, se retirará al completar migración) */
  readonly VITE_APPWRITE_ENDPOINT?: string;
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  readonly VITE_APPWRITE_DATABASE_ID?: string;
  readonly VITE_APPWRITE_COLLECTION_SOLICITUDES_ID?: string;
  readonly VITE_APPWRITE_FUNCTION_API_ID?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  /** Solo desarrollo local. Nunca en producción. */
  readonly VITE_APPWRITE_DEV_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

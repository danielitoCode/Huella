/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID?: string;
  readonly VITE_APPWRITE_COLLECTION_SOLICITUDES_ID?: string;
  readonly VITE_APPWRITE_FUNCTION_API_ID: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  /** Solo desarrollo local. Nunca en producción. */
  readonly VITE_APPWRITE_DEV_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

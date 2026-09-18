/**
 * SHIM de compatibilidad: las pantallas que aún importan `lib/appwrite`
 * reciben ApiError sin depender del SDK de Appwrite.
 * Preferir `import { ApiError } from '../errors'` en código nuevo.
 */
export { ApiError } from '../errors';

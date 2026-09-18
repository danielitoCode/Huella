/**
 * BLOQUE: Compat session store.
 * Propósito: reexportar la sesión de la feature auth (Supabase) para no romper
 * imports legacy (`from '../stores/session'` en Header, App, etc.).
 * Durante la migración, este archivo es un facade; la lógica vive en
 * core/features/auth/ui/store/authStore.ts.
 */

export {
  sessionUser,
  sessionLoading,
  loadSession,
  logout,
  login,
  type SessionUser,
} from '../../core/features/auth/ui/store/authStore';

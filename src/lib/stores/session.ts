/**
 * BLOQUE: Compat session store — reexporta feature auth (Supabase).
 */

export {
  sessionUser,
  sessionLoading,
  loadSession,
  logout,
  login,
  completePasswordChange,
  completePinReset,
  type SessionUser,
} from '../../core/features/auth/ui/store/authStore';

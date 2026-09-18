/**
 * BLOQUE: API pública de la feature auth.
 * Propósito: punto único de import para el resto de la aplicación.
 */

export type { OperadorAuth, OperadorRol, SessionAuthState } from './domain/entities/OperadorAuth';
export type { AuthRepository, LoginCredentials } from './domain/repositories/AuthRepository';
export { createAuthModule, type AuthModule } from './di/auth.module';
export {
  authUser,
  authLoading,
  authError,
  sessionUser,
  sessionLoading,
  loadSession,
  login,
  logout,
  getCurrentAuthUser,
  type SessionUser,
} from './ui/store/authStore';

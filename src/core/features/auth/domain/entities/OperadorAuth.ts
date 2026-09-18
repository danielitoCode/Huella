/**
 * BLOQUE: Entidad de dominio — operador autenticado.
 * Propósito: modelo de sesión de backoffice independiente de Appwrite/Supabase.
 * Usado por UI/store y casos de uso; no contiene secretos ni hashes.
 */

export type OperadorRol = 'admin' | 'operador';

export type OperadorAuth = {
  /** ID en auth.users (Supabase Auth). */
  userId: string;
  /** ID fila en tabla operadores. */
  operadorId: string;
  email: string;
  nombre: string;
  rol: OperadorRol;
  activo: boolean;
  mustChangePassword: boolean;
  /** true si cancel_pin_hash es null o representa reset a 0000. */
  pinNeedsReset: boolean;
  pinEstado: 'reseteado_0000' | 'configurado' | string;
  ultimoLoginAt: string | null;
};

export type SessionAuthState = {
  user: OperadorAuth | null;
  loading: boolean;
  error: string | null;
};

/**
 * BLOQUE: Contrato de repositorio de autenticación (puerto de dominio).
 * Propósito: desacoplar casos de uso de la implementación Supabase.
 * La capa de datos implementa este contrato; la UI nunca habla con Supabase directo.
 */

import type { OperadorAuth } from '../entities/OperadorAuth';

export type LoginCredentials = {
  email: string;
  password: string;
};

export interface AuthRepository {
  /** Inicia sesión email/password y resuelve perfil operador. */
  login(credentials: LoginCredentials): Promise<OperadorAuth>;

  /** Cierra sesión actual. */
  logout(): Promise<void>;

  /**
   * Restaura sesión desde storage local (refresh token).
   * null si no hay sesión o el usuario no tiene perfil operador activo.
   */
  restoreSession(): Promise<OperadorAuth | null>;

  /** Cambia contraseña del usuario autenticado. */
  changePassword(newPassword: string): Promise<void>;
}

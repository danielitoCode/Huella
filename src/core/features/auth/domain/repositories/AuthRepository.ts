/**
 * BLOQUE: Contrato de repositorio de autenticación (puerto de dominio).
 */

import type { OperadorAuth } from '../entities/OperadorAuth';

export type LoginCredentials = {
  email: string;
  password: string;
};

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<OperadorAuth>;
  logout(): Promise<void>;
  restoreSession(): Promise<OperadorAuth | null>;

  /**
   * Cambia contraseña en Supabase Auth y limpia must_change_password en operadores.
   * Requiere sesión activa.
   */
  completePasswordChange(params: {
    newPassword: string;
  }): Promise<OperadorAuth>;

  /**
   * Establece PIN de cancelación personal y limpia estado de reseteo.
   * pinActual debe ser 0000 o vacío tras reset de admin.
   */
  completePinReset(params: {
    pinActual: string;
    pinNuevo: string;
  }): Promise<OperadorAuth>;
}

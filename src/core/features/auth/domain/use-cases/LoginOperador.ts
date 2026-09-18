/**
 * BLOQUE: Caso de uso — Login de operador.
 * Propósito: validar credenciales mínimas y delegar en AuthRepository.
 */

import type { AuthRepository, LoginCredentials } from '../repositories/AuthRepository';
import type { OperadorAuth } from '../entities/OperadorAuth';

export function createLoginOperador(repo: AuthRepository) {
  return async function loginOperador(credentials: LoginCredentials): Promise<OperadorAuth> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      throw new Error('Correo y contraseña son obligatorios.');
    }

    return repo.login({ email, password });
  };
}

export type LoginOperador = ReturnType<typeof createLoginOperador>;

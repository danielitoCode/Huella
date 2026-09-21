/**
 * BLOQUE: Caso de uso — Logout de operador.
 * Propósito: cerrar sesión de forma segura e idempotente.
 */

import type { AuthRepository } from '../repositories/AuthRepository';

export function createLogoutOperador(repo: AuthRepository) {
  return async function logoutOperador(): Promise<void> {
    await repo.logout();
  };
}

export type LogoutOperador = ReturnType<typeof createLogoutOperador>;

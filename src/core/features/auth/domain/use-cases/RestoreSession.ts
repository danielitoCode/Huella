/**
 * BLOQUE: Caso de uso — Restaurar sesión al arrancar la app.
 * Propósito: hidratar el store de sesión sin forzar login de nuevo.
 */

import type { AuthRepository } from '../repositories/AuthRepository';
import type { OperadorAuth } from '../entities/OperadorAuth';

export function createRestoreSession(repo: AuthRepository) {
  return async function restoreSession(): Promise<OperadorAuth | null> {
    return repo.restoreSession();
  };
}

export type RestoreSession = ReturnType<typeof createRestoreSession>;

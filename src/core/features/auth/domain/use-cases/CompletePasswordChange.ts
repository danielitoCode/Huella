/**
 * BLOQUE: Caso de uso — completar cambio de contraseña obligatorio (SecurityGate).
 */

import type { AuthRepository } from '../repositories/AuthRepository';
import type { OperadorAuth } from '../entities/OperadorAuth';

export function createCompletePasswordChange(repo: AuthRepository) {
  return async function completePasswordChange(newPassword: string): Promise<OperadorAuth> {
    return repo.completePasswordChange({ newPassword });
  };
}

export type CompletePasswordChange = ReturnType<typeof createCompletePasswordChange>;

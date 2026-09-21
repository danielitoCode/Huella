/**
 * BLOQUE: Caso de uso — establecer PIN de cancelación tras reseteo admin.
 */

import type { AuthRepository } from '../repositories/AuthRepository';
import type { OperadorAuth } from '../entities/OperadorAuth';

export function createCompletePinReset(repo: AuthRepository) {
  return async function completePinReset(params: {
    pinActual: string;
    pinNuevo: string;
  }): Promise<OperadorAuth> {
    return repo.completePinReset(params);
  };
}

export type CompletePinReset = ReturnType<typeof createCompletePinReset>;

import { AppwriteFunctionApiTransport } from '../transport/AppwriteFunctionApiTransport';
import { TransportHuellaRepository } from './HuellaRepository';

/**
 * Implementación legacy conservada deliberadamente.
 * No se elimina: permite migración progresiva y rollback por repositorio.
 */
export class AppwriteFunctionHuellaRepository extends TransportHuellaRepository {
  constructor(functionId?: string) {
    super(new AppwriteFunctionApiTransport(functionId));
  }
}

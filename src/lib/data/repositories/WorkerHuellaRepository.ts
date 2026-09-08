import { WorkerApiTransport } from '../transport/WorkerApiTransport';
import { TransportHuellaRepository } from './HuellaRepository';

/**
 * Implementación explícita del repositorio contra Cloudflare Workers.
 * Cumple el mismo contrato HuellaRepository que cualquier backend alternativo.
 */
export class WorkerHuellaRepository extends TransportHuellaRepository {
  constructor(baseUrl?: string) {
    super(new WorkerApiTransport(baseUrl));
  }
}

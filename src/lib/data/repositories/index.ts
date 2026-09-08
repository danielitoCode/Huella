import { createApiTransport } from '../transport/createApiTransport';
import { TransportHuellaRepository, type HuellaRepository } from './HuellaRepository';
export { WorkerHuellaRepository } from './WorkerHuellaRepository';
export { AppwriteFunctionHuellaRepository } from './AppwriteFunctionHuellaRepository';
export type { HuellaRepository } from './HuellaRepository';

let repository: HuellaRepository | null = null;

/** Punto único de acceso del cliente para la capa de datos migrada. */
export function getHuellaRepository(): HuellaRepository {
  if (!repository) repository = new TransportHuellaRepository(createApiTransport());
  return repository;
}

/** Solo tests / cambio controlado de backend. */
export function __setHuellaRepositoryForTests(next: HuellaRepository | null): void {
  repository = next;
}

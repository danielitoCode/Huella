import { createApiTransport } from '../transport/createApiTransport';
import { TransportHuellaRepository, type HuellaRepository } from './HuellaRepository';
export { WorkerHuellaRepository } from './WorkerHuellaRepository';
export { AppwriteFunctionHuellaRepository } from './AppwriteFunctionHuellaRepository';
export type { HuellaRepository } from './HuellaRepository';

/** Facade solicitudes: implementación Supabase (migración). */
export {
  getSolicitudRepository,
  __setSolicitudRepositoryForTests,
} from './SolicitudRepository';
export type {
  SolicitudRepository,
  CreateSolicitudInput,
  UpdateSolicitudInput,
  SolicitudListOptions,
  SolicitudListResult,
} from './SolicitudRepository';

export {
  AppwriteAuditoriaRepository,
  getAuditoriaRepository,
  hitosSinteticos,
} from './AuditoriaRepository';
export type {
  EventoAuditoria,
  HitoPublico,
  AccionAuditoria,
  RegistrarAuditoriaInput,
} from './AuditoriaRepository';

let repository: HuellaRepository | null = null;

/**
 * Transporte RPC para operaciones que todavía requieren Worker/Function.
 * CRUD de solicitudes: getSolicitudRepository() → Supabase.
 */
export function getHuellaRepository(): HuellaRepository {
  if (!repository) repository = new TransportHuellaRepository(createApiTransport());
  return repository;
}

export function __setHuellaRepositoryForTests(next: HuellaRepository | null): void {
  repository = next;
}

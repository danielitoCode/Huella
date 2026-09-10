import { createApiTransport } from '../transport/createApiTransport';
import { TransportHuellaRepository, type HuellaRepository } from './HuellaRepository';
export { WorkerHuellaRepository } from './WorkerHuellaRepository';
export { AppwriteFunctionHuellaRepository } from './AppwriteFunctionHuellaRepository';
export type { HuellaRepository } from './HuellaRepository';
export {
  AppwriteSolicitudRepository,
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
 * No usar para el CRUD de solicitudes: ese dominio va directo al SDK de Appwrite.
 */
export function getHuellaRepository(): HuellaRepository {
  if (!repository) repository = new TransportHuellaRepository(createApiTransport());
  return repository;
}

export function __setHuellaRepositoryForTests(next: HuellaRepository | null): void {
  repository = next;
}

import type { Solicitud } from '../entities/Solicitud';

/**
 * Puerto de persistencia (domain).
 * Las implementaciones viven en infrastructure o en tests (in-memory).
 */
export interface SolicitudRepository {
  save(solicitud: Solicitud): Promise<void>;
  findById(id: string): Promise<Solicitud | null>;
  findByCodigo(codigo: string): Promise<Solicitud | null>;
  findByDiditSessionId(sessionId: string): Promise<Solicitud | null>;
  list(params?: { estado?: string }): Promise<Solicitud[]>;
}

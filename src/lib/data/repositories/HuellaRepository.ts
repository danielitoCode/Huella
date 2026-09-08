import type { ApiTransport } from '../transport/ApiTransport';

export interface HuellaRepository {
  request<T = unknown>(action: string, payload?: Record<string, unknown>): Promise<T>;
}

/**
 * Repositorio base reutilizable. Los repositorios de dominio pueden depender
 * de esta interfaz y no del Worker ni de Appwrite directamente.
 */
export class TransportHuellaRepository implements HuellaRepository {
  constructor(protected readonly transport: ApiTransport) {}

  request<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    return this.transport.execute<T>(action, payload);
  }
}

import type { Solicitud } from '../../core/features/solicitudes/domain/entities/Solicitud';
import type { SolicitudRepository } from '../../core/features/solicitudes/domain/repositories/SolicitudRepository';

/** Repositorio en memoria para tests y prototipos locales */
export class InMemorySolicitudRepository implements SolicitudRepository {
  private store = new Map<string, Solicitud>();

  async save(solicitud: Solicitud): Promise<void> {
    this.store.set(solicitud.id, solicitud);
  }

  async findById(id: string): Promise<Solicitud | null> {
    return this.store.get(id) ?? null;
  }

  async findByCodigo(codigo: string): Promise<Solicitud | null> {
    for (const s of this.store.values()) {
      if (s.codigoSeguimiento === codigo) return s;
    }
    return null;
  }

  async findByDiditSessionId(sessionId: string): Promise<Solicitud | null> {
    for (const s of this.store.values()) {
      if (s.diditSessionId === sessionId) return s;
    }
    return null;
  }

  async list(params?: { estado?: string }): Promise<Solicitud[]> {
    let items = [...this.store.values()];
    if (params?.estado) {
      items = items.filter((s) => s.estado === params.estado);
    }
    return items;
  }

  clear() {
    this.store.clear();
  }
}

import type { SolicitudRepository } from '../../domain/repositories/SolicitudRepository';
import { esCodigoSeguimientoValido } from '../../domain/services/CodigoSeguimiento';

export interface ConsultarPorCodigoDeps {
  repo: SolicitudRepository;
}

export function createConsultarPorCodigo(deps: ConsultarPorCodigoDeps) {
  return async function consultarPorCodigo(codigo: string) {
    const normalized = codigo.trim().toUpperCase();
    if (!esCodigoSeguimientoValido(normalized)) {
      return null;
    }
    const solicitud = await deps.repo.findByCodigo(normalized);
    if (!solicitud) return null;
    return solicitud.toVistaPublica();
  };
}

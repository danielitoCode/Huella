import type { SolicitudRepository } from '../../domain/repositories/SolicitudRepository';
import { DomainError } from '../../domain/entities/Solicitud';

export interface MarcarVerificadoDeps {
  repo: SolicitudRepository;
  now: () => string;
}

/** Invocado por el webhook Didit cuando status = Approved */
export function createMarcarVerificado(deps: MarcarVerificadoDeps) {
  return async function marcarVerificado(params: {
    diditSessionId?: string;
    solicitudId?: string;
  }) {
    let solicitud = params.diditSessionId
      ? await deps.repo.findByDiditSessionId(params.diditSessionId)
      : null;

    if (!solicitud && params.solicitudId) {
      solicitud = await deps.repo.findById(params.solicitudId);
    }

    if (!solicitud) {
      throw new DomainError('NOT_FOUND', 'Solicitud no encontrada para KYC');
    }

    const actualizada = solicitud.marcarVerificado({ ahora: deps.now() });
    await deps.repo.save(actualizada);
    return actualizada;
  };
}

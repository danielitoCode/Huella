import type { SolicitudRepository } from '../../domain/repositories/SolicitudRepository';
import type { EmailNotifier } from '../../domain/ports/EmailNotifier';
import { DomainError } from '../../domain/entities/Solicitud';

export interface CerrarSolicitudInput {
  solicitudId: string;
  motivoInterno: string;
  mensajePublico?: string;
  notificar?: boolean;
}

export interface CerrarSolicitudDeps {
  repo: SolicitudRepository;
  email: EmailNotifier;
  now: () => string;
  publicAppUrl: string;
}

export function createCerrarSolicitud(deps: CerrarSolicitudDeps) {
  return async function cerrarSolicitud(input: CerrarSolicitudInput) {
    const solicitud = await deps.repo.findById(input.solicitudId);
    if (!solicitud) {
      throw new DomainError('NOT_FOUND', 'Solicitud no encontrada');
    }

    const actualizada = solicitud.cerrar({
      motivoInterno: input.motivoInterno,
      mensajePublico: input.mensajePublico,
      ahora: deps.now(),
    });

    await deps.repo.save(actualizada);

    if (input.notificar !== false) {
      await deps.email.sendStatusUpdate({
        to: actualizada.email,
        nombreFamiliar: actualizada.nombreFamiliar,
        codigoSeguimiento: actualizada.codigoSeguimiento,
        estadoNuevo: 'cerrado',
        mensajePublico: actualizada.mensajePublico,
        trackingUrl: `${deps.publicAppUrl}/seguimiento/${actualizada.codigoSeguimiento}`,
      });
    }

    return actualizada;
  };
}

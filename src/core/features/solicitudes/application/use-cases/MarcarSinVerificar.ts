import type { SolicitudRepository } from '../../domain/repositories/SolicitudRepository';
import type { KycProvider } from '../../domain/ports/KycProvider';
import type { EmailNotifier } from '../../domain/ports/EmailNotifier';
import { DomainError } from '../../domain/entities/Solicitud';

export interface MarcarSinVerificarInput {
  solicitudId: string;
  notasInternas?: string;
  mensajePublico?: string;
}

export interface MarcarSinVerificarDeps {
  repo: SolicitudRepository;
  kyc: KycProvider;
  email: EmailNotifier;
  now: () => string;
  kycCallbackUrl?: string;
}

/**
 * Confirma hallazgo/contacto e inicia negociaciones:
 * pendiente → sin_verificar + sesión Didit + email KYC
 */
export function createMarcarSinVerificar(deps: MarcarSinVerificarDeps) {
  return async function marcarSinVerificar(input: MarcarSinVerificarInput) {
    const solicitud = await deps.repo.findById(input.solicitudId);
    if (!solicitud) {
      throw new DomainError('NOT_FOUND', 'Solicitud no encontrada');
    }

    const session = await deps.kyc.createSession({
      vendorData: solicitud.id,
      callbackUrl: deps.kycCallbackUrl,
    });

    const actualizada = solicitud.marcarSinVerificar({
      diditSessionId: session.sessionId,
      notasInternas: input.notasInternas,
      mensajePublico: input.mensajePublico,
      ahora: deps.now(),
    });

    await deps.repo.save(actualizada);

    await deps.email.sendKycLink({
      to: actualizada.email,
      nombreFamiliar: actualizada.nombreFamiliar,
      codigoSeguimiento: actualizada.codigoSeguimiento,
      verificationUrl: session.verificationUrl,
    });

    return actualizada;
  };
}

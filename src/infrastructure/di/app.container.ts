/**
 * Composición raíz de la aplicación.
 * Aquí se conectarán adaptadores reales (HTTP, Didit, email, DB).
 * Por ahora deja el cableado documentado para cuando existan implementaciones.
 */

import { createSolicitudesModule } from '../../core/features/solicitudes/di/solicitudes.module';
import type { SolicitudRepository } from '../../core/features/solicitudes/domain/repositories/SolicitudRepository';
import type { KycProvider } from '../../core/features/solicitudes/domain/ports/KycProvider';
import type { EmailNotifier } from '../../core/features/solicitudes/domain/ports/EmailNotifier';

export interface AppContainerDeps {
  repo: SolicitudRepository;
  kyc: KycProvider;
  email: EmailNotifier;
  publicAppUrl: string;
  kycCallbackUrl?: string;
}

export function createAppContainer(deps: AppContainerDeps) {
  const solicitudes = createSolicitudesModule({
    repo: deps.repo,
    kyc: deps.kyc,
    email: deps.email,
    publicAppUrl: deps.publicAppUrl,
    kycCallbackUrl: deps.kycCallbackUrl,
  });

  return {
    solicitudes,
  };
}

export type AppContainer = ReturnType<typeof createAppContainer>;

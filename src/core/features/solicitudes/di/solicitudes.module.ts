/**
 * Módulo DI de la feature solicitudes.
 * Compone casos de uso a partir de puertos inyectados (infra o fakes de test).
 */

import type { SolicitudRepository } from '../domain/repositories/SolicitudRepository';
import type { KycProvider } from '../domain/ports/KycProvider';
import type { EmailNotifier } from '../domain/ports/EmailNotifier';

import { createCrearSolicitud } from '../application/use-cases/CrearSolicitud';
import { createConsultarPorCodigo } from '../application/use-cases/ConsultarPorCodigo';
import { createMarcarSinVerificar } from '../application/use-cases/MarcarSinVerificar';
import { createMarcarVerificado } from '../application/use-cases/MarcarVerificado';
import { createCerrarSolicitud } from '../application/use-cases/CerrarSolicitud';

export interface SolicitudesModuleDeps {
  repo: SolicitudRepository;
  kyc: KycProvider;
  email: EmailNotifier;
  idGenerator?: () => string;
  now?: () => string;
  publicAppUrl: string;
  kycCallbackUrl?: string;
}

export function createSolicitudesModule(deps: SolicitudesModuleDeps) {
  const now = deps.now ?? (() => new Date().toISOString());
  const idGenerator =
    deps.idGenerator ??
    (() =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `id-${Date.now()}`);

  return {
    crearSolicitud: createCrearSolicitud({
      repo: deps.repo,
      email: deps.email,
      idGenerator,
      now,
      publicAppUrl: deps.publicAppUrl,
    }),
    consultarPorCodigo: createConsultarPorCodigo({ repo: deps.repo }),
    marcarSinVerificar: createMarcarSinVerificar({
      repo: deps.repo,
      kyc: deps.kyc,
      email: deps.email,
      now,
      kycCallbackUrl: deps.kycCallbackUrl,
    }),
    marcarVerificado: createMarcarVerificado({ repo: deps.repo, now }),
    cerrarSolicitud: createCerrarSolicitud({
      repo: deps.repo,
      email: deps.email,
      now,
      publicAppUrl: deps.publicAppUrl,
    }),
  };
}

export type SolicitudesModule = ReturnType<typeof createSolicitudesModule>;

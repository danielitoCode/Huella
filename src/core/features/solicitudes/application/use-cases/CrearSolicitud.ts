import { Solicitud } from '../../domain/entities/Solicitud';
import type { SolicitudRepository } from '../../domain/repositories/SolicitudRepository';
import type { EmailNotifier } from '../../domain/ports/EmailNotifier';
import { generarCodigoSeguimiento } from '../../domain/services/CodigoSeguimiento';

export interface CrearSolicitudInput {
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombrePersona: string;
  relacion: string;
  descripcion: string;
}

export interface CrearSolicitudDeps {
  repo: SolicitudRepository;
  email: EmailNotifier;
  idGenerator: () => string;
  now: () => string;
  publicAppUrl: string;
}

export function createCrearSolicitud(deps: CrearSolicitudDeps) {
  return async function crearSolicitud(input: CrearSolicitudInput) {
    const email = input.email.trim().toLowerCase();
    if (!input.nombreFamiliar?.trim()) throw validation('nombreFamiliar requerido');
    if (!email || !email.includes('@')) throw validation('email inválido');
    if (!input.nombrePersona?.trim()) throw validation('nombrePersona requerido');
    if (!input.relacion?.trim()) throw validation('relacion requerida');
    if (!input.descripcion?.trim()) throw validation('descripcion requerida');

    const codigo = generarCodigoSeguimiento();
    const ahora = deps.now();
    const solicitud = Solicitud.createNueva({
      id: deps.idGenerator(),
      codigoSeguimiento: codigo,
      nombreFamiliar: input.nombreFamiliar.trim(),
      email,
      telefono: input.telefono?.trim() || undefined,
      nombrePersona: input.nombrePersona.trim(),
      relacion: input.relacion.trim(),
      descripcion: input.descripcion.trim(),
      ahora,
    });

    await deps.repo.save(solicitud);

    const trackingUrl = `${deps.publicAppUrl}/seguimiento/${codigo}`;
    await deps.email.sendTracking({
      to: email,
      nombreFamiliar: solicitud.nombreFamiliar,
      codigoSeguimiento: codigo,
      trackingUrl,
    });

    return {
      codigoSeguimiento: codigo,
      trackingUrl,
      estado: solicitud.estado,
    };
  };
}

function validation(message: string) {
  return Object.assign(new Error(message), { code: 'VALIDATION' });
}

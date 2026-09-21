/**
 * BLOQUE: Compat — reexporta facade Supabase (antes Appwrite Databases SDK).
 * Preferir getSolicitudRepository() en código nuevo.
 */

import { getSolicitudRepository } from '../data/repositories/SolicitudRepository';
import type { EstadoSolicitud, Solicitud } from '../types';

export async function createSolicitud(input: {
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombrePersona: string;
  relacion: string;
  descripcion?: string;
}): Promise<Solicitud> {
  return getSolicitudRepository().create({
    ...input,
    descripcion: input.descripcion ?? '',
  });
}

export async function listSolicitudes(
  opts: {
    estado?: EstadoSolicitud | null;
    limit?: number;
    offset?: number;
  } = {},
): Promise<{ solicitudes: Solicitud[]; total: number }> {
  return getSolicitudRepository().list({
    estado: opts.estado || '',
    limit: opts.limit,
    offset: opts.offset,
  });
}

export async function getSolicitudById(solicitudId: string): Promise<Solicitud> {
  return getSolicitudRepository().getById(solicitudId);
}

export async function updateEstado(
  solicitudId: string,
  patch: {
    estado: EstadoSolicitud;
    notasInternas?: string;
    mensajePublico?: string;
    motivoCierre?: string;
    kycResultado?: string;
  },
): Promise<Solicitud> {
  return getSolicitudRepository().update(solicitudId, patch);
}

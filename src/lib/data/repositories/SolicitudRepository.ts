/**
 * BLOQUE: Facade SolicitudRepository — Supabase únicamente.
 */

import { getSupabase } from '../../supabase/client';
import { isSupabaseConfigured } from '../../supabase/config';
import { ApiError } from '../../errors';
import type { EstadoSolicitud, SeguimientoPublico, Solicitud } from '../../types';
import {
  SupabaseSolicitudRepository,
  SolicitudRepoError,
  type CreateSolicitudInput as SbCreate,
  type UpdateSolicitudInput as SbUpdate,
  type SolicitudListOptions as SbListOpts,
  type SolicitudListResult as SbListResult,
} from '../../../core/features/solicitudes/data/repositories/SupabaseSolicitudRepository';

export type CreateSolicitudInput = SbCreate;
export type UpdateSolicitudInput = SbUpdate;
export type SolicitudListOptions = SbListOpts;
export type SolicitudListResult = SbListResult;

export interface SolicitudRepository {
  create(input: CreateSolicitudInput): Promise<Solicitud>;
  getById(id: string): Promise<Solicitud>;
  getByCode(codigo: string): Promise<SeguimientoPublico>;
  list(options?: SolicitudListOptions): Promise<SolicitudListResult>;
  update(id: string, input: UpdateSolicitudInput): Promise<Solicitud>;
  delete(id: string): Promise<void>;
}

function toApiError(err: unknown): never {
  if (err instanceof SolicitudRepoError) {
    const code =
      err.code === 'NOT_FOUND'
        ? 'NOT_FOUND'
        : err.code === 'FORBIDDEN'
          ? 'FORBIDDEN'
          : 'SUPABASE';
    throw new ApiError(code, err.message, err.status);
  }
  if (err instanceof ApiError) throw err;
  const msg = err instanceof Error ? err.message : String(err);
  throw new ApiError('SUPABASE', msg);
}

class SupabaseSolicitudRepositoryAdapter implements SolicitudRepository {
  constructor(private readonly inner: SupabaseSolicitudRepository) {}

  create(input: CreateSolicitudInput) {
    return this.inner.create(input).catch(toApiError);
  }
  getById(id: string) {
    return this.inner.getById(id).catch(toApiError);
  }
  getByCode(codigo: string) {
    return this.inner.getByCode(codigo).catch(toApiError);
  }
  list(options?: SolicitudListOptions) {
    return this.inner.list(options).catch(toApiError);
  }
  update(id: string, input: UpdateSolicitudInput) {
    return this.inner.update(id, input).catch(toApiError);
  }
  delete(id: string) {
    return this.inner.delete(id).catch(toApiError);
  }
}

let repository: SolicitudRepository | null = null;

export function getSolicitudRepository(): SolicitudRepository {
  if (!repository) {
    if (!isSupabaseConfigured()) {
      throw new ApiError(
        'CONFIG',
        'Supabase no configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
      );
    }
    repository = new SupabaseSolicitudRepositoryAdapter(
      new SupabaseSolicitudRepository(getSupabase()),
    );
  }
  return repository;
}

export function __setSolicitudRepositoryForTests(next: SolicitudRepository | null): void {
  repository = next;
}

export type { EstadoSolicitud };

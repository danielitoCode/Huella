/**
 * BLOQUE: Facade auditoría — Supabase.
 */

import { getSupabase } from '../../supabase/client';
import { isSupabaseConfigured } from '../../supabase/config';
import {
  SupabaseAuditoriaRepository,
  hitosSinteticos,
  type AccionAuditoria,
  type ActorTipo,
  type EventoAuditoria,
  type HitoPublico,
  type RegistrarAuditoriaInput,
} from '../../../core/features/solicitudes/data/repositories/SupabaseAuditoriaRepository';

export type { AccionAuditoria, ActorTipo, EventoAuditoria, HitoPublico, RegistrarAuditoriaInput };
export { hitosSinteticos };

let repo: SupabaseAuditoriaRepository | null = null;

export function getAuditoriaRepository(): SupabaseAuditoriaRepository {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado para auditoría.');
  }
  if (!repo) repo = new SupabaseAuditoriaRepository(getSupabase());
  return repo;
}

export function __resetAuditoriaRepositoryForTests(): void {
  repo = null;
}

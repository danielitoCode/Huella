/**
 * BLOQUE: DI data-layer de solicitudes (Supabase).
 * Propósito: factory del repositorio concreto para el front migrado.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseSolicitudRepository } from '../data/repositories/SupabaseSolicitudRepository';

export function createSolicitudesDataModule(client: SupabaseClient) {
  return {
    solicitudRepo: new SupabaseSolicitudRepository(client),
  };
}

export type SolicitudesDataModule = ReturnType<typeof createSolicitudesDataModule>;

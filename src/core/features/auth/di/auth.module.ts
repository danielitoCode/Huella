/**
 * BLOQUE: Módulo DI de la feature auth.
 * Propósito: componer repositorio Supabase + casos de uso sin acoplar la UI.
 * Extensión futura: cambiar de SupabaseAuthRepository a otro adaptador sin tocar pantallas.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthRepository } from '../data/repositories/SupabaseAuthRepository';
import { createLoginOperador } from '../domain/use-cases/LoginOperador';
import { createLogoutOperador } from '../domain/use-cases/LogoutOperador';
import { createRestoreSession } from '../domain/use-cases/RestoreSession';
import type { AuthRepository } from '../domain/repositories/AuthRepository';

export type AuthModule = {
  repo: AuthRepository;
  loginOperador: ReturnType<typeof createLoginOperador>;
  logoutOperador: ReturnType<typeof createLogoutOperador>;
  restoreSession: ReturnType<typeof createRestoreSession>;
};

export function createAuthModule(client: SupabaseClient): AuthModule {
  const repo = new SupabaseAuthRepository(client);
  return {
    repo,
    loginOperador: createLoginOperador(repo),
    logoutOperador: createLogoutOperador(repo),
    restoreSession: createRestoreSession(repo),
  };
}

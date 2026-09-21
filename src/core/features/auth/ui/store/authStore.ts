/**
 * BLOQUE: Store de UI — sesión de operador (feature auth).
 * Incluye acciones de SecurityGate (password + PIN).
 */

import { writable, derived, get } from 'svelte/store';
import { getSupabase } from '../../../../../lib/supabase/client';
import { createAuthModule, type AuthModule } from '../../di/auth.module';
import type { OperadorAuth } from '../../domain/entities/OperadorAuth';
import type { OperadorRol } from '../../../../../lib/types';

export type SessionUser = {
  $id: string;
  email: string;
  name: string;
  rol?: OperadorRol | null;
  operadorId?: string | null;
  pinNeedsReset?: boolean;
  pinEstado?: string | null;
  mustChangePassword?: boolean;
};

function toSessionUser(op: OperadorAuth): SessionUser {
  return {
    $id: op.userId,
    email: op.email,
    name: op.nombre,
    rol: op.rol,
    operadorId: op.operadorId,
    pinNeedsReset: op.pinNeedsReset,
    pinEstado: op.pinEstado,
    mustChangePassword: op.mustChangePassword,
  };
}

let moduleSingleton: AuthModule | null = null;

function getAuthModule(): AuthModule {
  if (!moduleSingleton) {
    moduleSingleton = createAuthModule(getSupabase());
  }
  return moduleSingleton;
}

export const authUser = writable<OperadorAuth | null>(null);
export const authLoading = writable<boolean>(true);
export const authError = writable<string | null>(null);

export const sessionUser = derived(authUser, ($u) => ($u ? toSessionUser($u) : null));
export const sessionLoading = authLoading;

export async function loadSession(): Promise<void> {
  authLoading.set(true);
  authError.set(null);
  try {
    const user = await getAuthModule().restoreSession();
    authUser.set(user);
  } catch (err) {
    authUser.set(null);
    authError.set(err instanceof Error ? err.message : 'No se pudo restaurar la sesión.');
  } finally {
    authLoading.set(false);
  }
}

export async function login(email: string, password: string): Promise<OperadorAuth> {
  authError.set(null);
  const user = await getAuthModule().loginOperador({ email, password });
  authUser.set(user);
  return user;
}

export async function logout(): Promise<void> {
  try {
    await getAuthModule().logoutOperador();
  } finally {
    authUser.set(null);
  }
}

/** SecurityGate: nueva contraseña vía Supabase Auth + limpia flag en operadores. */
export async function completePasswordChange(newPassword: string): Promise<OperadorAuth> {
  const user = await getAuthModule().completePasswordChange(newPassword);
  authUser.set(user);
  return user;
}

/** SecurityGate: PIN de cancelación personal. */
export async function completePinReset(pinActual: string, pinNuevo: string): Promise<OperadorAuth> {
  const user = await getAuthModule().completePinReset({ pinActual, pinNuevo });
  authUser.set(user);
  return user;
}

export function getCurrentAuthUser(): OperadorAuth | null {
  return get(authUser);
}

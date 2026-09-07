/**
 * Store de sesión del operador (Appwrite Account + perfil Huella).
 */
import { writable } from 'svelte/store';
import { getAccount } from '../appwrite/client';
import { executeApi } from '../appwrite/executeApi';
import type { Operador, OperadorRol } from '../types';

export type SessionUser = {
  $id: string;
  email: string;
  name: string;
  rol?: OperadorRol | null;
  operadorId?: string | null;
  tienePin?: boolean;
};

export const sessionUser = writable<SessionUser | null>(null);
export const sessionLoading = writable<boolean>(true);

export async function loadSession(): Promise<void> {
  sessionLoading.set(true);
  try {
    const account = getAccount();
    const user = await account.get();
    let perfil: Operador | null = null;
    try {
      perfil = await executeApi<Operador>('operadores.me', {});
    } catch {
      // sin perfil aún (bootstrap)
    }
    sessionUser.set({
      $id: user.$id,
      email: user.email,
      name: user.name,
      rol: perfil?.rol ?? null,
      operadorId: perfil?.id ?? null,
      tienePin: perfil?.tienePin ?? false,
    });
  } catch {
    sessionUser.set(null);
  } finally {
    sessionLoading.set(false);
  }
}

export async function logout(): Promise<void> {
  try {
    const account = getAccount();
    await account.deleteSession('current');
  } catch {
    // ignore
  } finally {
    sessionUser.set(null);
  }
}

/**
 * Store de sesión del operador (Appwrite Account).
 *
 * - `sessionUser`: usuario autenticado o null.
 * - `loadSession()`: consulta la sesión activa al montar la app.
 * - `logout()`: destruye la sesión actual y limpia el store.
 */
import { writable } from 'svelte/store';
import { getAccount } from '../appwrite/client';

export type SessionUser = {
  $id: string;
  email: string;
  name: string;
};

export const sessionUser = writable<SessionUser | null>(null);
export const sessionLoading = writable<boolean>(true);

/**
 * Consulta la sesión activa en Appwrite.
 * Llama en `onMount` del Layout principal.
 */
export async function loadSession(): Promise<void> {
  sessionLoading.set(true);
  try {
    const account = getAccount();
    const user = await account.get();
    sessionUser.set({ $id: user.$id, email: user.email, name: user.name });
  } catch {
    sessionUser.set(null);
  } finally {
    sessionLoading.set(false);
  }
}

/**
 * Cierra la sesión actual en Appwrite y limpia el store.
 */
export async function logout(): Promise<void> {
  try {
    const account = getAccount();
    await account.deleteSession('current');
  } catch {
    // Ignorar error si ya expiró
  } finally {
    sessionUser.set(null);
  }
}

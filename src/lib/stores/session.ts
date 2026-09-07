import { writable } from 'svelte/store';
import { getAccount } from '../appwrite/client';
import { executeApi } from '../appwrite/executeApi';
import type { Operador, OperadorRol } from '../types';
import { addDevLog } from './devLogger';

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

export const sessionUser = writable<SessionUser | null>(null);
export const sessionLoading = writable<boolean>(true);

function rolFromLabels(labels: unknown): OperadorRol | null {
  if (!Array.isArray(labels)) return null;
  const lower = labels.map((l) => String(l).toLowerCase());
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('operador')) return 'operador';
  return null;
}

export async function loadSession(): Promise<void> {
  sessionLoading.set(true);
  try {
    const account = getAccount();
    const user = await account.get();
    const labelRol = rolFromLabels((user as { labels?: string[] }).labels);

    let perfil: Operador | null = null;
    try {
      perfil = await executeApi<Operador>('operadores.me', {});
    } catch (err) {
      addDevLog({
        type: 'api_err',
        title: 'operadores.me en loadSession (no bloquea sesión)',
        action: 'operadores.me',
        error: err instanceof Error ? err.message : String(err),
      });
      perfil = null;
    }

    sessionUser.set({
      $id: user.$id,
      email: user.email,
      name: user.name,
      // Preferir rol de colección; fallback a labels de Appwrite Auth
      rol: perfil?.rol ?? labelRol,
      operadorId: perfil?.id ?? null,
      pinNeedsReset: perfil?.pinNeedsReset ?? false,
      pinEstado: perfil?.pinEstado ?? null,
      mustChangePassword: perfil?.mustChangePassword ?? false,
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

import { writable } from 'svelte/store';
import type { Zona, RutaPublica, RutaAdmin } from '../types';

export interface RouterState {
  zona: Zona;
  rutaPublica: RutaPublica;
  rutaAdmin: RutaAdmin;
  /** id de solicitud cuando estamos en detalle */
  solicitudId?: string;
}

const initial: RouterState = {
  zona: 'public',
  rutaPublica: 'home',
  rutaAdmin: 'login',
};

export const router = writable<RouterState>(initial);

export function irAPublica(ruta: RutaPublica) {
  router.update((s) => ({
    ...s,
    zona: 'public',
    rutaPublica: ruta,
  }));
}

export function irAAdmin(ruta: RutaAdmin, solicitudId?: string) {
  router.update((s) => ({
    ...s,
    zona: 'admin',
    rutaAdmin: ruta,
    solicitudId,
  }));
}

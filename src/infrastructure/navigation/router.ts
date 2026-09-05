/**
 * Navegación de la SPA (infraestructura transversal, no pertenece a una feature).
 * Reexporta / centraliza el router usado por la UI.
 */
import { writable } from 'svelte/store';

export type Zona = 'public' | 'admin';
export type RutaPublica = 'home' | 'solicitud' | 'seguimiento';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle';

export interface RouterState {
  zona: Zona;
  rutaPublica: RutaPublica;
  rutaAdmin: RutaAdmin;
  solicitudId?: string;
  codigoSeguimiento?: string;
}

const initial: RouterState = {
  zona: 'public',
  rutaPublica: 'home',
  rutaAdmin: 'login',
};

export const router = writable<RouterState>(initial);

export function irAPublica(ruta: RutaPublica, extra?: { codigoSeguimiento?: string }) {
  router.update((s) => ({
    ...s,
    zona: 'public',
    rutaPublica: ruta,
    codigoSeguimiento: extra?.codigoSeguimiento,
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

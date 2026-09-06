import { writable, get } from 'svelte/store';
import type { Zona, RutaPublica, RutaAdmin } from '../types';

export interface RouterState {
  zona: Zona;
  rutaPublica: RutaPublica;
  rutaAdmin: RutaAdmin;
  /** id de solicitud cuando estamos en detalle admin */
  solicitudId?: string;
  /** código de seguimiento en ruta pública seguimiento */
  codigoSeguimiento?: string;
}

const initial: RouterState = {
  zona: 'public',
  rutaPublica: 'home',
  rutaAdmin: 'login',
};

export const router = writable<RouterState>(initial);

function pathFromState(s: RouterState): string {
  if (s.zona === 'admin') {
    if (s.rutaAdmin === 'detalle' && s.solicitudId) return `/admin/solicitudes/${s.solicitudId}`;
    if (s.rutaAdmin === 'solicitudes') return '/admin/solicitudes';
    if (s.rutaAdmin === 'dashboard') return '/admin';
    return '/admin/login';
  }
  if (s.rutaPublica === 'solicitud') return '/solicitud';
  if (s.rutaPublica === 'seguimiento') {
    return s.codigoSeguimiento
      ? `/seguimiento/${encodeURIComponent(s.codigoSeguimiento)}`
      : '/seguimiento';
  }
  return '/';
}

function applyPath(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const segs = path.split('/').filter(Boolean);

  if (segs[0] === 'admin') {
    if (segs[1] === 'solicitudes' && segs[2]) {
      router.set({
        zona: 'admin',
        rutaPublica: 'home',
        rutaAdmin: 'detalle',
        solicitudId: segs[2],
      });
      return;
    }
    if (segs[1] === 'solicitudes') {
      router.set({ zona: 'admin', rutaPublica: 'home', rutaAdmin: 'solicitudes' });
      return;
    }
    if (segs[1] === 'login' || !segs[1]) {
      router.set({
        zona: 'admin',
        rutaPublica: 'home',
        rutaAdmin: segs[1] === 'login' || !segs[1] ? (segs[1] === 'login' ? 'login' : 'dashboard') : 'dashboard',
      });
      // /admin → dashboard, /admin/login → login
      if (!segs[1]) {
        router.set({ zona: 'admin', rutaPublica: 'home', rutaAdmin: 'dashboard' });
      } else if (segs[1] === 'login') {
        router.set({ zona: 'admin', rutaPublica: 'home', rutaAdmin: 'login' });
      }
      return;
    }
    router.set({ zona: 'admin', rutaPublica: 'home', rutaAdmin: 'dashboard' });
    return;
  }

  if (segs[0] === 'solicitud') {
    router.set({ zona: 'public', rutaPublica: 'solicitud', rutaAdmin: 'login' });
    return;
  }

  if (segs[0] === 'seguimiento') {
    const codigo = segs[1] ? decodeURIComponent(segs[1]).toUpperCase() : undefined;
    router.set({
      zona: 'public',
      rutaPublica: 'seguimiento',
      rutaAdmin: 'login',
      codigoSeguimiento: codigo,
    });
    return;
  }

  router.set({ zona: 'public', rutaPublica: 'home', rutaAdmin: 'login' });
}

let listening = false;

/** Sincroniza rutas con el historial del navegador (SPA + fallback index.html). */
export function initRouter() {
  if (typeof window === 'undefined' || listening) return;
  listening = true;
  applyPath(window.location.pathname);
  window.addEventListener('popstate', () => applyPath(window.location.pathname));
}

function navigate(path: string, replace = false) {
  if (typeof window === 'undefined') return;
  if (replace) window.history.replaceState({}, '', path);
  else window.history.pushState({}, '', path);
  applyPath(path);
}

export function irAPublica(ruta: RutaPublica, codigoSeguimiento?: string) {
  const next: RouterState = {
    ...get(router),
    zona: 'public',
    rutaPublica: ruta,
    codigoSeguimiento: ruta === 'seguimiento' ? codigoSeguimiento : undefined,
  };
  navigate(pathFromState(next));
}

export function irAAdmin(ruta: RutaAdmin, solicitudId?: string) {
  const next: RouterState = {
    ...get(router),
    zona: 'admin',
    rutaAdmin: ruta,
    solicitudId,
  };
  navigate(pathFromState(next));
}

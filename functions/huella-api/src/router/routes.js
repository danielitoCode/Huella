import { solicitudesRoutes } from '../modules/solicitudes/solicitudes.routes.js';
import { diditRoutes } from '../modules/didit/didit.routes.js';
import { emailRoutes } from '../modules/email/email.routes.js';

/**
 * Carga operadores de forma aislada.
 * Si el módulo falla al importar, el resto de la API (solicitudes) sigue vivo.
 */
let operadoresRoutes = {};
try {
  const mod = await import('../modules/operadores/operadores.routes.js');
  operadoresRoutes = mod.operadoresRoutes || {};
} catch (e) {
  console.error('[huella-api] operadores routes no cargaron:', e && e.message ? e.message : e);
}

export const routes = {
  ...solicitudesRoutes,
  ...diditRoutes,
  ...emailRoutes,
  ...operadoresRoutes,
};

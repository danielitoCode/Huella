import { solicitudesRoutes } from '../modules/solicitudes/solicitudes.routes.js';
import { diditRoutes } from '../modules/didit/didit.routes.js';
import { emailRoutes } from '../modules/email/email.routes.js';
import { operadoresRoutes } from '../modules/operadores/operadores.routes.js';

export const routes = {
  ...solicitudesRoutes,
  ...diditRoutes,
  ...emailRoutes,
  ...operadoresRoutes,
};

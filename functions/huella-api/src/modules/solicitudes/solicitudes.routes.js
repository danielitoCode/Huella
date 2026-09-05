import { AUTH } from '../../shared/constants.js';
import { createSolicitudesService } from './solicitudes.service.js';
import {
  validateCreate,
  validateGetByCode,
  validateMarcarSinVerificar,
} from './solicitudes.validator.js';

export const solicitudesRoutes = {
  'solicitudes.create': {
    auth: AUTH.PUBLIC,
    validate: validateCreate,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.create(payload);
    },
  },
  'solicitudes.getByCode': {
    auth: AUTH.PUBLIC,
    validate: validateGetByCode,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.getByCode(payload);
    },
  },
  'solicitudes.marcarSinVerificar': {
    auth: AUTH.ADMIN,
    validate: validateMarcarSinVerificar,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.marcarSinVerificar({
        ...payload,
        operatorId: ctx.identity.userId,
      });
    },
  },
};

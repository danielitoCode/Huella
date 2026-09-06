import { AUTH } from '../../shared/constants.js';
import { createSolicitudesService } from './solicitudes.service.js';
import {
  validateCreate,
  validateGetByCode,
  validateMarcarSinVerificar,
  validateList,
  validateGetById,
  validateCerrar,
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
  'solicitudes.list': {
    auth: AUTH.ADMIN,
    validate: validateList,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.list(payload);
    },
  },
  'solicitudes.getById': {
    auth: AUTH.ADMIN,
    validate: validateGetById,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.getById(payload);
    },
  },
  'solicitudes.cerrar': {
    auth: AUTH.ADMIN,
    validate: validateCerrar,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.cerrar(payload);
    },
  },
};

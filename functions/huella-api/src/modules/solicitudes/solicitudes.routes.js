import { AUTH } from '../../shared/constants.js';
import { createSolicitudesService } from './solicitudes.service.js';
import {
  validateCreate,
  validateGetByCode,
  validateMarcarAtendido,
  validateMarcarSinVerificar,
  validateIniciarKyc,
  validateMarcarVerificado,
  validateList,
  validateGetById,
  validateCerrar,
  validateCancelar,
  validateSolicitudIdOnly,
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
  'solicitudes.marcarAtendido': {
    auth: AUTH.ADMIN,
    validate: validateMarcarAtendido,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.marcarAtendido({
        ...payload,
        operatorId: ctx.identity.userId,
      });
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
  'solicitudes.iniciarKyc': {
    auth: AUTH.ADMIN,
    validate: validateIniciarKyc,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.iniciarKyc({
        ...payload,
        operatorId: ctx.identity.userId,
      });
    },
  },
  'solicitudes.reenviarKycEmail': {
    auth: AUTH.ADMIN,
    validate: validateSolicitudIdOnly,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.reenviarKycEmail(payload);
    },
  },
  'solicitudes.getKycEmailTemplate': {
    auth: AUTH.ADMIN,
    validate: validateSolicitudIdOnly,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.getKycEmailTemplate(payload);
    },
  },
  'solicitudes.marcarVerificado': {
    auth: AUTH.ADMIN,
    validate: validateMarcarVerificado,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.marcarVerificado(payload);
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
  'solicitudes.cancelar': {
    auth: AUTH.ADMIN,
    validate: validateCancelar,
    handler: async (ctx, payload) => {
      const service = createSolicitudesService(ctx.req);
      return service.cancelar(payload);
    },
  },
};

import { AUTH } from '../../shared/constants.js';
import { createOperadoresService } from './operadores.service.js';
import {
  validateCreate,
  validateList,
  validateSetRole,
  validateSetActive,
  validateSetPin,
  validateSetPassword,
} from './operadores.validator.js';

export const operadoresRoutes = {
  'operadores.me': {
    auth: AUTH.ADMIN,
    handler: async (ctx) => {
      const service = createOperadoresService(ctx.req);
      return service.me({ identity: ctx.identity });
    },
  },
  'operadores.list': {
    auth: AUTH.ADMIN,
    validate: validateList,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.list(payload, ctx.identity);
    },
  },
  'operadores.create': {
    auth: AUTH.ADMIN,
    validate: validateCreate,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.create(payload, ctx.identity);
    },
  },
  'operadores.setRole': {
    auth: AUTH.ADMIN,
    validate: validateSetRole,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.setRole(payload, ctx.identity);
    },
  },
  'operadores.setActive': {
    auth: AUTH.ADMIN,
    validate: validateSetActive,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.setActive(payload, ctx.identity);
    },
  },
  'operadores.setCancelPin': {
    auth: AUTH.ADMIN,
    validate: validateSetPin,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.setCancelPin(payload, ctx.identity);
    },
  },
  'operadores.setPassword': {
    auth: AUTH.ADMIN,
    validate: validateSetPassword,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.setPassword(payload, ctx.identity);
    },
  },
};

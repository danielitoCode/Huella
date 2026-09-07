import { AUTH } from '../../shared/constants.js';
import { createOperadoresService } from './operadores.service.js';
import {
  validateCreate,
  validateList,
  validateSetRole,
  validateSetActive,
  validateOperadorId,
  validateSetOwnPin,
  validateChangeOwnPassword,
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
  /** Admin: reset PIN → 0000 */
  'operadores.resetCancelPin': {
    auth: AUTH.ADMIN,
    validate: validateOperadorId,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.resetCancelPin(payload, ctx.identity);
    },
  },
  /** Titular: establece su PIN (desde 0000 o cambiando el actual) */
  'operadores.setOwnCancelPin': {
    auth: AUTH.ADMIN,
    validate: validateSetOwnPin,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.setOwnCancelPin(payload, ctx.identity);
    },
  },
  /** Admin: reset password → 12345678 */
  'operadores.resetPassword': {
    auth: AUTH.ADMIN,
    validate: validateOperadorId,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.resetPassword(payload, ctx.identity);
    },
  },
  /** Titular: cambia su password */
  'operadores.changeOwnPassword': {
    auth: AUTH.ADMIN,
    validate: validateChangeOwnPassword,
    handler: async (ctx, payload) => {
      const service = createOperadoresService(ctx.req);
      return service.changeOwnPassword(payload, ctx.identity);
    },
  },
};

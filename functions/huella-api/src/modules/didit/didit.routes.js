import { AUTH } from '../../shared/constants.js';
import { createDiditService } from './didit.service.js';
import { validateCreateSession } from './didit.validator.js';

export const diditRoutes = {
  'didit.createSession': {
    auth: AUTH.ADMIN,
    validate: validateCreateSession,
    handler: async (ctx, payload) => {
      const service = createDiditService(ctx.req);
      return service.createSession({
        solicitudId: payload.solicitudId,
        operatorId: ctx.identity.userId,
      });
    },
  },
};

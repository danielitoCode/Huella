import { AUTH } from '../../shared/constants.js';
import { createEmailService } from './email.service.js';
import { validateSend } from './email.validator.js';

export const emailRoutes = {
  'email.send': {
    auth: AUTH.ADMIN,
    validate: validateSend,
    handler: async (_ctx, payload) => {
      const service = createEmailService();
      return service.send(payload);
    },
  },
};

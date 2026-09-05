import { sendEmail } from '../../infrastructure/email/email.client.js';
import { renderTemplate } from './email.templates.js';

export function createEmailService() {
  return {
    async send(input) {
      let subject = input.subject;
      let text = input.text;
      let html = input.html;

      if (input.template) {
        const tpl = renderTemplate(input.template, input.vars || {});
        subject = tpl.subject;
        text = tpl.text;
        html = tpl.html;
      }

      const result = await sendEmail({ to: input.to, subject, text, html });
      return { sent: true, providerId: result.id || null };
    },
  };
}

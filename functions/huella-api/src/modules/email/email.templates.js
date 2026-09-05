import { EMAIL_TEMPLATES } from '../../shared/constants.js';

export function renderTemplate(template, vars = {}) {
  switch (template) {
    case EMAIL_TEMPLATES.TRACKING:
      return {
        subject: `Huella — Solicitud recibida (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nRecibimos tu solicitud. Código: ${vars.codigo}\nConsulta: ${vars.trackingUrl}\n\nNo necesitas crear una cuenta.`,
        html: `<p>Hola ${vars.nombreFamiliar},</p><p>Recibimos tu solicitud.</p><p><strong>Código:</strong> ${vars.codigo}</p><p><a href="${vars.trackingUrl}">Consultar estado</a></p>`,
      };
    case EMAIL_TEMPLATES.KYC_LINK:
      return {
        subject: `Huella — Verificación de identidad (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nPara avanzar con tu caso (${vars.codigo}), completa la verificación:\n${vars.verificationUrl}\n`,
        html: `<p>Hola ${vars.nombreFamiliar},</p><p>Para avanzar con tu caso <strong>${vars.codigo}</strong>:</p><p><a href="${vars.verificationUrl}">Verificar identidad</a></p>`,
      };
    case EMAIL_TEMPLATES.STATUS_UPDATE:
      return {
        subject: `Huella — Actualización (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nEstado: ${vars.estado}\n${vars.mensajePublico || ''}`,
        html: `<p>Hola ${vars.nombreFamiliar},</p><p>Estado: <strong>${vars.estado}</strong></p><p>${vars.mensajePublico || ''}</p>`,
      };
    case EMAIL_TEMPLATES.KYC_APPROVED:
      return {
        subject: `Huella — Identidad verificada (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nTu identidad fue verificada. Continuamos con tu caso ${vars.codigo}.`,
        html: `<p>Hola ${vars.nombreFamiliar},</p><p>Tu identidad fue verificada.</p>`,
      };
    case EMAIL_TEMPLATES.KYC_DECLINED:
      return {
        subject: `Huella — Verificación incompleta (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nNo pudimos completar la verificación para ${vars.codigo}.`,
        html: `<p>Hola ${vars.nombreFamiliar},</p><p>No pudimos completar la verificación de identidad.</p>`,
      };
    default:
      return {
        subject: vars.subject || 'Huella',
        text: vars.text || vars.body || '',
        html: vars.html || `<p>${vars.text || vars.body || ''}</p>`,
      };
  }
}

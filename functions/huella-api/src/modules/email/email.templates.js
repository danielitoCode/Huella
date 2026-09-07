import { EMAIL_TEMPLATES } from '../../shared/constants.js';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plantilla base memorial (HTML email). */
export function wrapEmailHtml({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#071923;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#071923;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#0e2738;border:1px solid rgba(198,164,106,0.35);border-radius:12px;">
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;">
              <div style="font-size:22px;letter-spacing:0.08em;color:#C6A46A;font-weight:700;">HUELLA</div>
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a4b4c0;margin-top:6px;">Memorial Digital</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;color:#e8e4dc;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.08);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a8b99;text-align:center;">
              Huella · Verdad · Memoria · Dignidad<br/>
              Este mensaje es confidencial. No respondas a este correo si no es la vía indicada.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function operatorContactBlock(vars = {}) {
  const name = vars.operatorName || process.env.OPERATOR_CONTACT_NAME || '';
  const email = vars.operatorEmail || process.env.OPERATOR_CONTACT_EMAIL || '';
  const phone = vars.operatorPhone || process.env.OPERATOR_CONTACT_PHONE || '';
  const note =
    vars.operatorNote ||
    process.env.OPERATOR_CONTACT_NOTE ||
    'Si no puedes completar Didit (conectividad limitada), contacta al operador para verificación asistida.';

  if (!name && !email && !phone) {
    return `<p style="margin:16px 0 0;color:#a4b4c0;font-size:14px;">${escapeHtml(note)}</p>`;
  }

  return `
    <div style="margin-top:20px;padding:14px 16px;background:rgba(198,164,106,0.08);border:1px solid rgba(198,164,106,0.28);border-radius:8px;">
      <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C6A46A;margin-bottom:8px;">Verificación asistida</div>
      <p style="margin:0 0 8px;color:#e8e4dc;font-size:14px;">${escapeHtml(note)}</p>
      ${name ? `<p style="margin:0;color:#e8e4dc;font-size:14px;"><strong>Operador:</strong> ${escapeHtml(name)}</p>` : ''}
      ${email ? `<p style="margin:4px 0 0;font-size:14px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#C6A46A;">${escapeHtml(email)}</a></p>` : ''}
      ${phone ? `<p style="margin:4px 0 0;font-size:14px;"><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
    </div>`;
}

export function renderTemplate(template, vars = {}) {
  const nombre = escapeHtml(vars.nombreFamiliar || '');
  const codigo = escapeHtml(vars.codigo || '');
  const trackingUrl = vars.trackingUrl || '#';
  const verificationUrl = vars.verificationUrl || '#';

  switch (template) {
    case EMAIL_TEMPLATES.TRACKING:
      return {
        subject: `Huella — Solicitud recibida (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nRecibimos tu solicitud. Código: ${vars.codigo}\nConsulta: ${vars.trackingUrl}\n\nNo necesitas crear una cuenta.`,
        html: wrapEmailHtml({
          title: 'Solicitud recibida',
          bodyHtml: `
            <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0 0 12px;">Hemos registrado tu solicitud de búsqueda.</p>
            <p style="margin:0 0 16px;"><strong>Código de seguimiento:</strong><br/>
              <span style="font-family:monospace;font-size:18px;color:#C6A46A;letter-spacing:0.06em;">${codigo}</span>
            </p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${trackingUrl}" style="display:inline-block;background:#C6A46A;color:#071923;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;">Consultar estado</a>
            </p>
            <p style="margin:0;color:#a4b4c0;font-size:13px;">No necesitas crear una cuenta.</p>`,
        }),
      };

    case EMAIL_TEMPLATES.KYC_LINK:
      return {
        subject: `Huella — Verificación de identidad (${vars.codigo})`,
        text: [
          `Hola ${vars.nombreFamiliar},`,
          ``,
          `Tu caso (${vars.codigo}) está en atención. Completa la verificación de identidad:`,
          vars.verificationUrl,
          ``,
          `Si no puedes usar Didit, contacta al operador para verificación asistida.`,
          vars.operatorName ? `Operador: ${vars.operatorName}` : '',
          vars.operatorEmail ? `Email: ${vars.operatorEmail}` : '',
          vars.operatorPhone ? `Tel: ${vars.operatorPhone}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        html: wrapEmailHtml({
          title: 'Verificación de identidad',
          bodyHtml: `
            <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0 0 12px;">Tu expediente <strong style="font-family:monospace;color:#C6A46A;">${codigo}</strong> está <strong>atendido · pendiente de verificación</strong>.</p>
            <p style="margin:0 0 16px;">Puedes completar la verificación digital (Didit) con el siguiente enlace:</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${verificationUrl}" style="display:inline-block;background:#C6A46A;color:#071923;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;">Verificar identidad (Didit)</a>
            </p>
            <p style="margin:0;color:#a4b4c0;font-size:13px;">El enlace es personal y está asociado a tu solicitud.</p>
            ${operatorContactBlock(vars)}`,
        }),
      };

    case EMAIL_TEMPLATES.STATUS_UPDATE:
      return {
        subject: `Huella — Actualización (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nEstado: ${vars.estado}\n${vars.mensajePublico || ''}`,
        html: wrapEmailHtml({
          title: 'Actualización',
          bodyHtml: `
            <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0 0 8px;">Expediente <strong style="font-family:monospace;color:#C6A46A;">${codigo}</strong></p>
            <p style="margin:0 0 12px;">Estado: <strong>${escapeHtml(vars.estado || '')}</strong></p>
            <p style="margin:0;">${escapeHtml(vars.mensajePublico || '')}</p>`,
        }),
      };

    case EMAIL_TEMPLATES.KYC_APPROVED:
      return {
        subject: `Huella — Identidad verificada (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nTu identidad fue verificada. Continuamos con tu caso ${vars.codigo}.`,
        html: wrapEmailHtml({
          title: 'Identidad verificada',
          bodyHtml: `
            <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0;">Tu identidad fue verificada. Continuamos con el expediente <strong style="font-family:monospace;color:#C6A46A;">${codigo}</strong>.</p>`,
        }),
      };

    case EMAIL_TEMPLATES.KYC_DECLINED:
      return {
        subject: `Huella — Verificación incompleta (${vars.codigo})`,
        text: `Hola ${vars.nombreFamiliar},\n\nNo pudimos completar la verificación para ${vars.codigo}.`,
        html: wrapEmailHtml({
          title: 'Verificación incompleta',
          bodyHtml: `
            <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0 0 12px;">No pudimos completar la verificación de identidad para <strong style="font-family:monospace;color:#C6A46A;">${codigo}</strong>.</p>
            ${operatorContactBlock(vars)}`,
        }),
      };

    default:
      return {
        subject: vars.subject || 'Huella',
        text: vars.text || vars.body || '',
        html: vars.html || wrapEmailHtml({ title: 'Huella', bodyHtml: `<p>${escapeHtml(vars.text || vars.body || '')}</p>` }),
      };
  }
}

/** HTML listo para copiar/pegar en el cliente de correo del operador. */
export function buildKycCopyPasteHtml(vars) {
  return renderTemplate(EMAIL_TEMPLATES.KYC_LINK, vars).html;
}

export function getOperatorContactPublic() {
  return {
    name: process.env.OPERATOR_CONTACT_NAME || null,
    email: process.env.OPERATOR_CONTACT_EMAIL || null,
    phone: process.env.OPERATOR_CONTACT_PHONE || null,
    note:
      process.env.OPERATOR_CONTACT_NOTE ||
      'Si no puedes completar la verificación digital, contacta al equipo para una vía asistida.',
  };
}

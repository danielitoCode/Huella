export function mapDiditStatus(status) {
  switch (status) {
    case 'Approved':
      return {
        kycStatus: 'Approved',
        kycResultado: 'approved',
        solicitudEstado: 'verificado',
        mensajePublico: 'Identidad verificada. Continuamos con tu caso.',
      };
    case 'Declined':
      return {
        kycStatus: 'Declined',
        kycResultado: 'declined',
        solicitudEstado: null,
        mensajePublico: null,
      };
    case 'Expired':
    case 'Kyc Expired':
      return {
        kycStatus: status,
        kycResultado: 'expired',
        solicitudEstado: null,
        mensajePublico: null,
      };
    case 'Abandoned':
      return {
        kycStatus: 'Abandoned',
        kycResultado: 'failed',
        solicitudEstado: null,
        mensajePublico: null,
      };
    case 'Not Started':
    case 'In Progress':
    case 'Awaiting User':
    case 'In Review':
    case 'Resubmitted':
      return {
        kycStatus: status,
        kycResultado: null,
        solicitudEstado: null,
        mensajePublico: null,
      };
    default:
      return {
        kycStatus: status,
        kycResultado: null,
        solicitudEstado: null,
        mensajePublico: null,
        unknown: true,
      };
  }
}

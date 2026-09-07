export const ESTADOS = Object.freeze({
  PENDIENTE: 'pendiente',
  /** Atendido por operador; identidad aún no confirmada */
  SIN_VERIFICAR: 'sin_verificar',
  VERIFICADO: 'verificado',
  CERRADO: 'cerrado',
  CANCELADA: 'cancelada',
});

/** Transiciones de negocio permitidas (destino → orígenes válidos). */
export const TRANSICIONES = Object.freeze({
  [ESTADOS.SIN_VERIFICAR]: [ESTADOS.PENDIENTE],
  [ESTADOS.VERIFICADO]: [ESTADOS.SIN_VERIFICAR],
  [ESTADOS.CERRADO]: [ESTADOS.SIN_VERIFICAR, ESTADOS.VERIFICADO],
  [ESTADOS.CANCELADA]: [ESTADOS.PENDIENTE, ESTADOS.SIN_VERIFICAR, ESTADOS.VERIFICADO],
});

export const AUTH = Object.freeze({
  PUBLIC: 'public',
  USER: 'user',
  ADMIN: 'admin',
  INTERNAL: 'internal',
});

export const EMAIL_TEMPLATES = Object.freeze({
  TRACKING: 'tracking',
  STATUS_UPDATE: 'status-update',
  KYC_LINK: 'kyc-link',
  KYC_APPROVED: 'kyc-approved',
  KYC_DECLINED: 'kyc-declined',
  WELCOME: 'welcome',
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password-reset',
});

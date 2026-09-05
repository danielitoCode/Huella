export const ESTADOS = Object.freeze({
  PENDIENTE: 'pendiente',
  SIN_VERIFICAR: 'sin_verificar',
  VERIFICADO: 'verificado',
  CERRADO: 'cerrado',
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

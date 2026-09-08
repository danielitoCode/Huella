export type Env = {
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_API_KEY: string;
  APPWRITE_DATABASE_ID?: string;
  APPWRITE_COLLECTION_SOLICITUDES?: string;
  APPWRITE_COLLECTION_OPERADORES?: string;
  APPWRITE_COLLECTION_KYC?: string;
  /** Labels que cuentan como admin (default: admin). Como list_users ADMIN_LABELS */
  ADMIN_LABELS?: string;
  PIN_SALT?: string;
  CORS_ORIGINS?: string;
  PUBLIC_APP_URL?: string;
  DIDIT_API_KEY?: string;
  DIDIT_WORKFLOW_ID?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  OPERATOR_CONTACT_NAME?: string;
  OPERATOR_CONTACT_EMAIL?: string;
  OPERATOR_CONTACT_PHONE?: string;
  OPERATOR_CONTACT_NOTE?: string;
};

export function dbIds(env: Env) {
  return {
    databaseId: env.APPWRITE_DATABASE_ID || 'huella',
    solicitudes: env.APPWRITE_COLLECTION_SOLICITUDES || 'solicitudes',
    operadores: env.APPWRITE_COLLECTION_OPERADORES || 'operadores',
    kyc: env.APPWRITE_COLLECTION_KYC || 'kyc_verifications',
  };
}

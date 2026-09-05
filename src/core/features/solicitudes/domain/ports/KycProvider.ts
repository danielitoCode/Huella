/**
 * Puerto para el proveedor de identidad (Didit u otro).
 * Application depende de esta abstracción; infrastructure la implementa.
 */
export interface KycSession {
  sessionId: string;
  verificationUrl: string;
}

export interface KycProvider {
  createSession(params: {
    vendorData: string;
    callbackUrl?: string;
  }): Promise<KycSession>;
}

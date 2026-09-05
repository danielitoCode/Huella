export interface EmailNotifier {
  sendTracking(params: {
    to: string;
    nombreFamiliar: string;
    codigoSeguimiento: string;
    trackingUrl: string;
  }): Promise<void>;

  sendKycLink(params: {
    to: string;
    nombreFamiliar: string;
    codigoSeguimiento: string;
    verificationUrl: string;
  }): Promise<void>;

  sendStatusUpdate(params: {
    to: string;
    nombreFamiliar: string;
    codigoSeguimiento: string;
    estadoNuevo: string;
    mensajePublico?: string;
    trackingUrl: string;
  }): Promise<void>;
}

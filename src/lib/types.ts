/** Tipos compartidos de la plataforma Huella */

export type EstadoSolicitud =
  | 'pendiente'
  | 'en_revision'
  | 'en_proceso'
  | 'resuelta'
  | 'rechazada';

export interface Solicitud {
  id: string;
  nombreFamiliar: string;
  email: string;
  telefono?: string;
  nombreFallecido: string;
  relacion: string;
  descripcion: string;
  estado: EstadoSolicitud;
  fechaCreacion: string;
  fechaActualizacion?: string;
  notasAdmin?: string;
}

export type Zona = 'public' | 'admin';

export type RutaPublica = 'home' | 'solicitud';
export type RutaAdmin = 'login' | 'dashboard' | 'solicitudes' | 'detalle';

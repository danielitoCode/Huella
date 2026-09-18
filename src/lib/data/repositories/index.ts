/**
 * BLOQUE: Facades de datos — solo Supabase (sin Appwrite / worker).
 */

export {
  getSolicitudRepository,
  __setSolicitudRepositoryForTests,
} from './SolicitudRepository';
export type {
  SolicitudRepository,
  CreateSolicitudInput,
  UpdateSolicitudInput,
  SolicitudListOptions,
  SolicitudListResult,
} from './SolicitudRepository';

export {
  getAuditoriaRepository,
  hitosSinteticos,
  __resetAuditoriaRepositoryForTests,
} from './AuditoriaRepository';
export type {
  EventoAuditoria,
  HitoPublico,
  AccionAuditoria,
  RegistrarAuditoriaInput,
} from './AuditoriaRepository';

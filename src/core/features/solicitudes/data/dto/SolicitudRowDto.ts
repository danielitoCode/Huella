/**
 * BLOQUE: DTO — fila cruda de `public.solicitudes` (PostgreSQL / Supabase).
 * Propósito: reflejar snake_case del schema real del proyecto.
 * Campos opcionales = columnas que pueden no existir en todos los entornos.
 */

export type SolicitudRowDto = {
  id: string;
  codigo_seguimiento: string;
  nombre_familiar: string;
  email: string;
  telefono: string | null;
  nombre_persona: string;
  relacion: string;
  descripcion: string | null;
  estado: string;
  mensaje_publico?: string | null;
  notas_internas?: string | null;
  didit_session_id?: string | null;
  didit_verification_url?: string | null;
  verification_url?: string | null;
  kyc_resultado?: string | null;
  motivo_cierre?: string | null;
  created_at: string;
  updated_at: string;
};

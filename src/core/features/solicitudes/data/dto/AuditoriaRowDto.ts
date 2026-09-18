/**
 * BLOQUE: DTO — fila de `public.auditoria` (Supabase).
 * Acepta snake_case del schema PostgreSQL.
 */

export type AuditoriaRowDto = {
  id: string;
  solicitud_id: string;
  codigo_seguimiento: string | null;
  accion: string;
  actor_tipo: string;
  actor_id: string;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  motivo: string | null;
  metadata: string | null;
  fecha: string;
  created_at?: string;
};

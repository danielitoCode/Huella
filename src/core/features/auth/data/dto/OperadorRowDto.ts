/**
 * BLOQUE: DTO — fila cruda de la tabla `operadores` en Supabase/PostgreSQL.
 * Propósito: reflejar columnas snake_case del schema; no se usa en UI.
 */

export type OperadorRowDto = {
  id: string;
  user_id: string;
  email: string;
  nombre: string;
  rol: string | null;
  activo: boolean | string | null;
  cancel_pin_hash: string | null;
  must_change_password: boolean | null;
  ultimo_login_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

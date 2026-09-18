/**
 * BLOQUE: Mapper DTO → entidad de dominio OperadorAuth.
 * Propósito: normalizar booleanos, roles y estado del PIN de cancelación.
 */

import type { OperadorAuth, OperadorRol } from '../../domain/entities/OperadorAuth';
import type { OperadorRowDto } from '../dto/OperadorRowDto';

function asBool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'si' || s === 'sí') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
  }
  return fallback;
}

function mapRol(raw: string | null | undefined): OperadorRol {
  const r = (raw ?? '').trim().toLowerCase();
  if (r === 'admin') return 'admin';
  return 'operador';
}

/**
 * Política PIN (migración desde Appwrite):
 * - hash vacío / null → necesita configurar PIN
 * - valor simbólico de reset → pinNeedsReset true
 */
function mapPin(hash: string | null | undefined): {
  pinNeedsReset: boolean;
  pinEstado: string;
} {
  const h = (hash ?? '').trim();
  if (!h || h === '0000' || h.toLowerCase() === 'reset') {
    return { pinNeedsReset: true, pinEstado: 'reseteado_0000' };
  }
  return { pinNeedsReset: false, pinEstado: 'configurado' };
}

export function mapOperadorRowToAuth(row: OperadorRowDto): OperadorAuth {
  const pin = mapPin(row.cancel_pin_hash);
  return {
    userId: row.user_id,
    operadorId: row.id,
    email: row.email,
    nombre: row.nombre || row.email,
    rol: mapRol(row.rol),
    activo: asBool(row.activo, true),
    mustChangePassword: asBool(row.must_change_password, false),
    pinNeedsReset: pin.pinNeedsReset,
    pinEstado: pin.pinEstado,
    ultimoLoginAt: row.ultimo_login_at ?? null,
  };
}

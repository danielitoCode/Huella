/**
 * BLOQUE: Repositorio de equipo / operadores vía Supabase Client.
 * Propósito: reemplazar worker operadores.me / list / setRole / setActive / resetPin.
 * Crear usuario Auth y reset password requieren service_role → pendiente Edge Function;
 * en MVP el admin lo hace en el panel de Supabase Auth si hace falta.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Operador, OperadorRol } from '../../../../../lib/types';
import type { OperadorRowDto } from '../dto/OperadorRowDto';
import { mapOperadorRowToAuth } from '../mappers/operadorMapper';

function toOperador(row: OperadorRowDto): Operador {
  const auth = mapOperadorRowToAuth(row);
  return {
    id: auth.operadorId,
    userId: auth.userId,
    email: auth.email,
    nombre: auth.nombre,
    rol: auth.rol,
    activo: auth.activo,
    pinNeedsReset: auth.pinNeedsReset,
    pinEstado: auth.pinEstado,
    mustChangePassword: auth.mustChangePassword,
    ultimoLoginAt: auth.ultimoLoginAt,
  };
}

const SELECT =
  'id, user_id, email, nombre, rol, activo, cancel_pin_hash, must_change_password, ultimo_login_at';

export class SupabaseOperadoresRepository {
  constructor(private readonly client: SupabaseClient) {}

  async me(): Promise<Operador> {
    const { data: session, error: sErr } = await this.client.auth.getSession();
    if (sErr || !session.session?.user?.id) {
      throw new Error('No hay sesión activa.');
    }
    const { data, error } = await this.client
      .from('operadores')
      .select(SELECT)
      .eq('user_id', session.session.user.id)
      .maybeSingle();

    if (error) throw new Error(error.message || 'No se pudo cargar el perfil.');
    if (!data) throw new Error('No tienes perfil de operador.');
    return toOperador(data as OperadorRowDto);
  }

  async list(limit = 100): Promise<{ operadores: Operador[]; total: number }> {
    const { data, error, count } = await this.client
      .from('operadores')
      .select(SELECT, { count: 'exact' })
      .order('nombre', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(
        error.message ||
          'No se pudo listar operadores. Si eres admin, aplica policy admin_select_operadores.',
      );
    }
    const operadores = (data as OperadorRowDto[] | null)?.map(toOperador) ?? [];
    return { operadores, total: count ?? operadores.length };
  }

  async setRole(operadorId: string, rol: OperadorRol): Promise<void> {
    const { error } = await this.client
      .from('operadores')
      .update({ rol })
      .eq('id', operadorId);
    if (error) throw new Error(error.message || 'No se pudo cambiar el rol.');
  }

  async setActive(operadorId: string, activo: boolean): Promise<void> {
    const { error } = await this.client
      .from('operadores')
      .update({ activo })
      .eq('id', operadorId);
    if (error) throw new Error(error.message || 'No se pudo cambiar el estado activo.');
  }

  /** Reset PIN de fábrica: hash vacío / marcador de reset. */
  async resetCancelPin(operadorId: string): Promise<Operador> {
    const { data, error } = await this.client
      .from('operadores')
      .update({ cancel_pin_hash: null })
      .eq('id', operadorId)
      .select(SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message || 'No se pudo resetear el PIN.');
    if (!data) throw new Error('Operador no encontrado o sin permiso UPDATE.');
    return toOperador(data as OperadorRowDto);
  }

  async setOwnCancelPin(pinActual: string, pin: string): Promise<void> {
    // Delegado al flujo SecurityGate vía auth repo; aquí solo por API de Equipo.
    const { completePinReset } = await import(
      '../../ui/store/authStore'
    );
    await completePinReset(pinActual, pin);
  }
}

let singleton: SupabaseOperadoresRepository | null = null;

export function getOperadoresRepository(client: SupabaseClient): SupabaseOperadoresRepository {
  if (!singleton) singleton = new SupabaseOperadoresRepository(client);
  return singleton;
}

/**
 * BLOQUE: Repositorio concreto — Auth + perfil operador vía Supabase Client SDK.
 * Incluye SecurityGate: cambio de contraseña (Auth) y PIN de cancelación (tabla operadores).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthRepository,
  LoginCredentials,
} from '../../domain/repositories/AuthRepository';
import type { OperadorAuth } from '../../domain/entities/OperadorAuth';
import type { OperadorRowDto } from '../dto/OperadorRowDto';
import { mapOperadorRowToAuth } from '../mappers/operadorMapper';

function authErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: string }).message);
  }
  return fallback;
}

/** Hash SHA-256 hex del PIN (no guardamos el PIN en claro). */
async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin.trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isResetPinHash(hash: string | null | undefined): boolean {
  const h = (hash ?? '').trim();
  return !h || h === '0000' || h.toLowerCase() === 'reset';
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async login(credentials: LoginCredentials): Promise<OperadorAuth> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        throw new Error('Correo o contraseña incorrectos.');
      }
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        throw new Error(
          'Error de red al conectar con Supabase. Revisa URL, anon key y estado del proyecto.',
        );
      }
      throw new Error(error.message || 'No se pudo iniciar sesión.');
    }

    const userId = data.user?.id;
    if (!userId) {
      throw new Error('Sesión creada sin usuario. Intenta de nuevo.');
    }

    const perfil = await this.loadOperadorByUserId(userId);
    if (!perfil) {
      await this.client.auth.signOut();
      throw new Error(
        'Tu cuenta no tiene perfil de operador en Huella. Contacta a un administrador.',
      );
    }
    if (!perfil.activo) {
      await this.client.auth.signOut();
      throw new Error('Tu cuenta de operador está desactivada.');
    }

    await this.touchUltimoLogin(perfil.operadorId);
    return { ...perfil, ultimoLoginAt: new Date().toISOString() };
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      console.warn('[auth] logout:', authErrorMessage(error, 'signOut'));
    }
  }

  async restoreSession(): Promise<OperadorAuth | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error || !data.session?.user?.id) {
      return null;
    }

    const perfil = await this.loadOperadorByUserId(data.session.user.id);
    if (!perfil || !perfil.activo) {
      return null;
    }
    return perfil;
  }

  async completePasswordChange(params: { newPassword: string }): Promise<OperadorAuth> {
    const newPassword = params.newPassword;
    if (!newPassword || newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if (newPassword === '12345678') {
      throw new Error('No uses la contraseña temporal 12345678.');
    }

    const { data: sessionData, error: sessionErr } = await this.client.auth.getSession();
    if (sessionErr || !sessionData.session?.user?.id) {
      throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');
    }
    const userId = sessionData.session.user.id;

    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message || 'No se pudo cambiar la contraseña en Auth.');
    }

    const perfil = await this.loadOperadorByUserId(userId);
    if (!perfil) {
      throw new Error('Perfil de operador no encontrado tras cambiar contraseña.');
    }

    const { error: updErr } = await this.client
      .from('operadores')
      .update({ must_change_password: false })
      .eq('id', perfil.operadorId);

    if (updErr) {
      throw new Error(
        `Contraseña actualizada en Auth, pero no se pudo limpiar must_change_password: ${updErr.message}. Revisa RLS UPDATE en operadores.`,
      );
    }

    return {
      ...perfil,
      mustChangePassword: false,
    };
  }

  async completePinReset(params: {
    pinActual: string;
    pinNuevo: string;
  }): Promise<OperadorAuth> {
    const pinNuevo = params.pinNuevo.trim();
    const pinActual = params.pinActual.trim();

    if (!/^\d{4}$/.test(pinNuevo) || pinNuevo === '0000') {
      throw new Error('El nuevo PIN debe ser 4 dígitos y distinto de 0000.');
    }

    const { data: sessionData, error: sessionErr } = await this.client.auth.getSession();
    if (sessionErr || !sessionData.session?.user?.id) {
      throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');
    }

    const perfil = await this.loadOperadorByUserId(sessionData.session.user.id);
    if (!perfil) {
      throw new Error('Perfil de operador no encontrado.');
    }

    // Tras reset admin el hash está vacío / 0000 / "reset"
    const { data: row, error: readErr } = await this.client
      .from('operadores')
      .select('cancel_pin_hash')
      .eq('id', perfil.operadorId)
      .maybeSingle();

    if (readErr) {
      throw new Error(readErr.message || 'No se pudo leer el PIN actual.');
    }

    const currentHash = (row as { cancel_pin_hash?: string | null } | null)?.cancel_pin_hash;
    if (!isResetPinHash(currentHash)) {
      // Si ya hay PIN configurado, exigir que pinActual coincida con el hash
      const actualHash = await hashPin(pinActual);
      if (actualHash !== currentHash) {
        throw new Error('El PIN actual no es correcto.');
      }
    } else if (pinActual && pinActual !== '0000') {
      throw new Error('Tras un reseteo el PIN actual debe ser 0000.');
    }

    const newHash = await hashPin(pinNuevo);
    const { error: updErr } = await this.client
      .from('operadores')
      .update({ cancel_pin_hash: newHash })
      .eq('id', perfil.operadorId);

    if (updErr) {
      throw new Error(
        `No se pudo guardar el PIN: ${updErr.message}. Revisa RLS UPDATE en operadores.`,
      );
    }

    return {
      ...perfil,
      pinNeedsReset: false,
      pinEstado: 'configurado',
    };
  }

  private async loadOperadorByUserId(userId: string): Promise<OperadorAuth | null> {
    const { data, error } = await this.client
      .from('operadores')
      .select(
        'id, user_id, email, nombre, rol, activo, cancel_pin_hash, must_change_password, ultimo_login_at',
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[auth] loadOperador:', error.message);
      throw new Error(
        `No se pudo cargar el perfil de operador: ${error.message}. Revisa RLS y la tabla operadores.`,
      );
    }
    if (!data) return null;
    return mapOperadorRowToAuth(data as OperadorRowDto);
  }

  private async touchUltimoLogin(operadorId: string): Promise<void> {
    const { error } = await this.client
      .from('operadores')
      .update({ ultimo_login_at: new Date().toISOString() })
      .eq('id', operadorId);
    if (error) {
      console.warn('[auth] touchUltimoLogin:', error.message);
    }
  }
}

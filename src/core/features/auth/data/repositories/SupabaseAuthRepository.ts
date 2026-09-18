/**
 * BLOQUE: Repositorio concreto — Auth + perfil operador vía Supabase Client SDK.
 * Propósito: reemplazar Appwrite Account + operadores.me (worker/function).
 * Flujo:
 *  1) auth.signInWithPassword
 *  2) select en tabla operadores filtrado por user_id = auth.uid()
 *  3) validar activo + rol
 *  4) touch ultimo_login_at
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
      // Idempotente: si ya no hay sesión, no fallar la UI.
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

  async changePassword(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message || 'No se pudo cambiar la contraseña.');
    }
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
      // No bloquea el login; solo telemetría de último acceso.
      console.warn('[auth] touchUltimoLogin:', error.message);
    }
  }
}

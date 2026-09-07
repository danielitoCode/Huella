import { AppError } from '../../shared/errors.js';

const ROLES = ['admin', 'operador'];

export function validateCreate(payload = {}) {
  const email = String(payload.email || '').trim().toLowerCase();
  const nombre = String(payload.nombre || payload.name || '').trim();
  const password = String(payload.password || '').trim();
  const rol = String(payload.rol || 'operador').trim().toLowerCase();
  const cancelPin = payload.cancelPin != null ? String(payload.cancelPin).trim() : '';

  if (!email || !email.includes('@')) throw new AppError('VALIDATION', 'email inválido');
  if (!nombre) throw new AppError('VALIDATION', 'nombre requerido');
  if (password.length < 8) throw new AppError('VALIDATION', 'password mínimo 8 caracteres');
  if (!ROLES.includes(rol)) throw new AppError('VALIDATION', 'rol debe ser admin u operador');
  if (cancelPin && !/^\d{4}$/.test(cancelPin)) {
    throw new AppError('VALIDATION', 'cancelPin debe ser 4 dígitos');
  }

  return { email, nombre, password, rol, cancelPin: cancelPin || undefined };
}

export function validateSetRole(payload = {}) {
  const operadorId = String(payload.operadorId || payload.id || '').trim();
  const rol = String(payload.rol || '').trim().toLowerCase();
  if (!operadorId) throw new AppError('VALIDATION', 'operadorId requerido');
  if (!ROLES.includes(rol)) throw new AppError('VALIDATION', 'rol inválido');
  return { operadorId, rol };
}

export function validateSetActive(payload = {}) {
  const operadorId = String(payload.operadorId || payload.id || '').trim();
  if (!operadorId) throw new AppError('VALIDATION', 'operadorId requerido');
  const activo = Boolean(payload.activo);
  return { operadorId, activo };
}

export function validateSetPin(payload = {}) {
  const operadorId = payload.operadorId ? String(payload.operadorId).trim() : undefined;
  const pin = String(payload.pin || payload.cancelPin || '').trim();
  if (!/^\d{4}$/.test(pin)) throw new AppError('VALIDATION', 'PIN debe ser 4 dígitos');
  return { operadorId, pin };
}

export function validateSetPassword(payload = {}) {
  const operadorId = String(payload.operadorId || payload.id || '').trim();
  const password = String(payload.password || payload.newPassword || '').trim();
  if (!operadorId) throw new AppError('VALIDATION', 'operadorId requerido');
  if (password.length < 8) throw new AppError('VALIDATION', 'password mínimo 8 caracteres');
  return { operadorId, password };
}

export function validateList(payload = {}) {
  const limit = Math.min(Number(payload.limit) || 50, 100);
  const offset = Math.max(Number(payload.offset) || 0, 0);
  return { limit, offset };
}

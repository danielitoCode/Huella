import { AppError } from '../../shared/errors.js';

const ROLES = ['admin', 'operador'];

export function validateCreate(payload = {}) {
  const email = String(payload.email || '').trim().toLowerCase();
  const nombre = String(payload.nombre || payload.name || '').trim();
  const rol = String(payload.rol || 'operador').trim().toLowerCase();

  if (!email || !email.includes('@')) throw new AppError('VALIDATION', 'email inválido');
  if (!nombre) throw new AppError('VALIDATION', 'nombre requerido');
  if (!ROLES.includes(rol)) throw new AppError('VALIDATION', 'rol debe ser admin u operador');

  return { email, nombre, rol };
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
  return { operadorId, activo: Boolean(payload.activo) };
}

export function validateOperadorId(payload = {}) {
  const operadorId = String(payload.operadorId || payload.id || '').trim();
  if (!operadorId) throw new AppError('VALIDATION', 'operadorId requerido');
  return { operadorId };
}

export function validateSetOwnPin(payload = {}) {
  const pin = String(payload.pin || payload.cancelPin || payload.pinNuevo || '').trim();
  if (!/^\d{4}$/.test(pin)) throw new AppError('VALIDATION', 'PIN nuevo debe ser 4 dígitos');
  const pinActual =
    payload.pinActual != null ? String(payload.pinActual).trim() : undefined;
  return { pin, pinActual };
}

export function validateChangeOwnPassword(payload = {}) {
  const passwordNueva = String(payload.passwordNueva || payload.password || '').trim();
  if (passwordNueva.length < 8) {
    throw new AppError('VALIDATION', 'passwordNueva mínimo 8 caracteres');
  }
  const passwordActual =
    payload.passwordActual != null ? String(payload.passwordActual).trim() : undefined;
  return { passwordNueva, passwordActual };
}

export function validateList(payload = {}) {
  const limit = Math.min(Number(payload.limit) || 50, 100);
  const offset = Math.max(Number(payload.offset) || 0, 0);
  return { limit, offset };
}

import { AppError } from '../../shared/errors.js';
import { esCodigoValido } from '../../shared/codigo.js';

export function validateCreate(payload = {}) {
  const nombreFamiliar = String(payload.nombreFamiliar || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const nombrePersona = String(payload.nombrePersona || '').trim();
  const relacion = String(payload.relacion || '').trim();
  const descripcion = String(payload.descripcion || '').trim();
  const telefono = payload.telefono ? String(payload.telefono).trim() : undefined;

  if (!nombreFamiliar) throw new AppError('VALIDATION', 'nombreFamiliar requerido');
  if (!email || !email.includes('@')) throw new AppError('VALIDATION', 'email inválido');
  if (!nombrePersona) throw new AppError('VALIDATION', 'nombrePersona requerido');
  if (!relacion) throw new AppError('VALIDATION', 'relacion requerida');
  if (!descripcion) throw new AppError('VALIDATION', 'descripcion requerida');

  return { nombreFamiliar, email, telefono, nombrePersona, relacion, descripcion };
}

export function validateGetByCode(payload = {}) {
  const codigo = String(payload.codigo || payload.codigoSeguimiento || '').trim().toUpperCase();
  if (!esCodigoValido(codigo)) throw new AppError('VALIDATION', 'código de seguimiento inválido');
  return { codigo };
}

export function validateMarcarSinVerificar(payload = {}) {
  const solicitudId = String(payload.solicitudId || '').trim();
  if (!solicitudId) throw new AppError('VALIDATION', 'solicitudId requerido');
  return {
    solicitudId,
    notasInternas: payload.notasInternas ? String(payload.notasInternas) : undefined,
    mensajePublico: payload.mensajePublico ? String(payload.mensajePublico) : undefined,
  };
}

export function validateList(payload = {}) {
  const ESTADOS_VALIDOS = ['pendiente', 'sin_verificar', 'verificado', 'cerrado'];
  const estado = payload.estado ? String(payload.estado).trim() : undefined;
  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError('VALIDATION', `estado inválido: ${estado}`);
  }
  const limit = Math.min(Number(payload.limit) || 25, 100);
  const offset = Math.max(Number(payload.offset) || 0, 0);
  return { estado, limit, offset };
}

export function validateGetById(payload = {}) {
  const solicitudId = String(payload.solicitudId || payload.id || '').trim();
  if (!solicitudId) throw new AppError('VALIDATION', 'solicitudId requerido');
  return { solicitudId };
}

export function validateCerrar(payload = {}) {
  const solicitudId = String(payload.solicitudId || '').trim();
  if (!solicitudId) throw new AppError('VALIDATION', 'solicitudId requerido');
  const motivoInterno = String(payload.motivoInterno || '').trim();
  if (!motivoInterno) throw new AppError('VALIDATION', 'motivoInterno requerido');
  return { solicitudId, motivoInterno };
}

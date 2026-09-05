import { describe, it, expect } from 'vitest';
import {
  validateCreate,
  validateGetByCode,
  validateMarcarSinVerificar,
} from './solicitudes.validator.js';
import { AppError } from '../../shared/errors.js';

describe('validateCreate', () => {
  const valid = {
    nombreFamiliar: 'Ana',
    email: 'ana@example.com',
    nombrePersona: 'Luis',
    relacion: 'hermana',
    descripcion: 'Buscamos a Luis',
  };

  it('acepta payload válido', () => {
    const out = validateCreate(valid);
    expect(out.email).toBe('ana@example.com');
    expect(out.nombreFamiliar).toBe('Ana');
  });

  it('rechaza email inválido', () => {
    expect(() => validateCreate({ ...valid, email: 'nope' })).toThrow(AppError);
  });

  it('rechaza campos vacíos', () => {
    expect(() => validateCreate({ ...valid, nombreFamiliar: '' })).toThrow(AppError);
  });
});

describe('validateGetByCode', () => {
  it('acepta código válido', () => {
    expect(validateGetByCode({ codigo: 'HUE-2026-AB23CD' }).codigo).toBe('HUE-2026-AB23CD');
  });

  it('rechaza código inválido', () => {
    expect(() => validateGetByCode({ codigo: 'x' })).toThrow(AppError);
  });
});

describe('validateMarcarSinVerificar', () => {
  it('exige solicitudId', () => {
    expect(() => validateMarcarSinVerificar({})).toThrow(AppError);
  });

  it('acepta solicitudId', () => {
    expect(validateMarcarSinVerificar({ solicitudId: 'abc' }).solicitudId).toBe('abc');
  });
});

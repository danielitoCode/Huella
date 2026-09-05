import { describe, it, expect } from 'vitest';
import { generarCodigoSeguimiento, esCodigoValido } from './codigo.js';

describe('codigoSeguimiento', () => {
  it('genera formato HUE-YYYY-XXXXXX', () => {
    const codigo = generarCodigoSeguimiento(new Date('2026-09-05T12:00:00Z'));
    expect(codigo).toMatch(/^HUE-2026-[A-Z2-9]{6}$/);
    const suffix = codigo.split('-')[2];
    // alfabeto de generación sin 0, 1, I, O
    expect(suffix).not.toMatch(/[01IO]/);
  });

  it('esCodigoValido acepta formato correcto', () => {
    expect(esCodigoValido('HUE-2026-AB23CD')).toBe(true);
  });

  it('esCodigoValido rechaza inválidos', () => {
    expect(esCodigoValido('')).toBe(false);
    expect(esCodigoValido('ABC')).toBe(false);
    expect(esCodigoValido('HUE-26-AB23CD')).toBe(false);
    // dígito 1 no está en el alfabeto de generación (2-9)
    expect(esCodigoValido('HUE-2026-AB12CD')).toBe(false);
  });

  it('normaliza a mayúsculas en validación', () => {
    expect(esCodigoValido('hue-2026-ab23cd')).toBe(true);
  });
});

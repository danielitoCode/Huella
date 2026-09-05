import { describe, it, expect } from 'vitest';
import { generarCodigoSeguimiento, esCodigoValido } from './codigo.js';

describe('codigoSeguimiento', () => {
  it('genera formato HUE-YYYY-XXXXXX', () => {
    const codigo = generarCodigoSeguimiento(new Date('2026-09-05T12:00:00Z'));
    expect(codigo).toMatch(/^HUE-2026-[A-Z2-9]{6}$/);
  });

  it('esCodigoValido acepta formato correcto', () => {
    expect(esCodigoValido('HUE-2026-AB12CD')).toBe(true);
  });

  it('esCodigoValido rechaza inválidos', () => {
    expect(esCodigoValido('')).toBe(false);
    expect(esCodigoValido('ABC')).toBe(false);
    expect(esCodigoValido('HUE-26-AB12CD')).toBe(false);
    expect(esCodigoValido('HUE-2026-ab12cd')).toBe(false);
  });

  it('normaliza a mayúsculas en validación', () => {
    // el validador uppercases antes de testear
    expect(esCodigoValido('hue-2026-AB12CD')).toBe(true);
  });
});

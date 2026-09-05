import { describe, it, expect } from 'vitest';
import {
  generarCodigoSeguimiento,
  esCodigoSeguimientoValido,
} from './CodigoSeguimiento';

describe('CodigoSeguimiento', () => {
  it('genera formato HUE-YYYY-XXXXXX',
    () => {
      const codigo = generarCodigoSeguimiento(new Date('2026-09-05T00:00:00Z'), () => 0);
      expect(codigo).toMatch(/^HUE-2026-[A-Z2-9]{6}$/);
      expect(esCodigoSeguimientoValido(codigo)).toBe(true);
    });

  it('rechaza códigos inválidos',
    () => {
      expect(esCodigoSeguimientoValido('ABC')).toBe(false);
      expect(esCodigoSeguimientoValido('HUE-26-ABCDEF')).toBe(false);
    });
});

import { describe, it, expect } from 'vitest';
import { routes } from './routes.js';

describe('routes registry', () => {
  it('expone acciones del dominio Huella', () => {
    expect(routes['solicitudes.create']).toBeDefined();
    expect(routes['solicitudes.getByCode']).toBeDefined();
    expect(routes['solicitudes.marcarSinVerificar']).toBeDefined();
    expect(routes['didit.createSession']).toBeDefined();
    expect(routes['email.send']).toBeDefined();
  });

  it('cada ruta declara auth y handler', () => {
    for (const [name, route] of Object.entries(routes)) {
      expect(route.auth, name).toBeTruthy();
      expect(typeof route.handler, name).toBe('function');
    }
  });

  it('solicitudes.create es public', () => {
    expect(routes['solicitudes.create'].auth).toBe('public');
  });

  it('acciones admin requieren admin', () => {
    expect(routes['solicitudes.marcarSinVerificar'].auth).toBe('admin');
    expect(routes['didit.createSession'].auth).toBe('admin');
    expect(routes['email.send'].auth).toBe('admin');
  });
});

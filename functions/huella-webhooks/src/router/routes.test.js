import { describe, it, expect } from 'vitest';
import { providers, resolveProvider } from './routes.js';

describe('webhook providers', () => {
  it('registra didit', () => {
    expect(typeof providers.didit).toBe('function');
  });

  it('resolveProvider lee path /webhooks/didit', () => {
    expect(resolveProvider({ path: '/webhooks/didit' })).toBe('didit');
  });

  it('resolveProvider lee query provider', () => {
    expect(resolveProvider({ path: '/', query: { provider: 'didit' } })).toBe('didit');
  });

  it('default es didit', () => {
    expect(resolveProvider({ path: '/' })).toBe('didit');
  });
});

import { describe, it, expect } from 'vitest';
import { mapDiditStatus } from './didit.mapper.js';

describe('mapDiditStatus', () => {
  it('Approved → verificado + approved', () => {
    const m = mapDiditStatus('Approved');
    expect(m.solicitudEstado).toBe('verificado');
    expect(m.kycResultado).toBe('approved');
  });

  it('Declined no cambia estado de solicitud', () => {
    const m = mapDiditStatus('Declined');
    expect(m.solicitudEstado).toBeNull();
    expect(m.kycResultado).toBe('declined');
  });

  it('Expired mapea kycResultado expired', () => {
    expect(mapDiditStatus('Expired').kycResultado).toBe('expired');
    expect(mapDiditStatus('Kyc Expired').kycResultado).toBe('expired');
  });

  it('estados intermedios no marcan verificado', () => {
    for (const s of ['Not Started', 'In Progress', 'Awaiting User', 'In Review', 'Resubmitted']) {
      expect(mapDiditStatus(s).solicitudEstado).toBeNull();
    }
  });

  it('es case-sensitive: approved minúscula no es Approved', () => {
    const m = mapDiditStatus('approved');
    expect(m.solicitudEstado).toBeNull();
    expect(m.unknown).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { Solicitud, DomainError } from './Solicitud';

function basePendiente() {
  return Solicitud.createNueva({
    id: '1',
    codigoSeguimiento: 'HUE-2026-ABC123',
    nombreFamiliar: 'María',
    email: 'maria@example.com',
    nombrePersona: 'Carlos',
    relacion: 'Madre',
    descripcion: 'Busco información',
    ahora: '2026-09-05T12:00:00.000Z',
  });
}

describe('Solicitud (domain)', () => {
  it('se crea en estado pendiente',
    () => {
      const s = basePendiente();
      expect(s.estado).toBe('pendiente');
    });

  it('pendiente → sin_verificar con sesión Didit',
    () => {
      const s = basePendiente().marcarSinVerificar({
        diditSessionId: 'sess_1',
        ahora: '2026-09-05T13:00:00.000Z',
      });
      expect(s.estado).toBe('sin_verificar');
      expect(s.diditSessionId).toBe('sess_1');
    });

  it('no permite saltar a sin_verificar desde cerrado',
    () => {
      const cerrada = basePendiente().cerrar({
        motivoInterno: 'duplicado',
        ahora: '2026-09-05T13:00:00.000Z',
      });
      expect(() =>
        cerrada.marcarSinVerificar({
          diditSessionId: 'x',
          ahora: '2026-09-05T14:00:00.000Z',
        }),
      ).toThrow(DomainError);
    });

  it('sin_verificar → verificado',
    () => {
      const s = basePendiente()
        .marcarSinVerificar({
          diditSessionId: 'sess_1',
          ahora: '2026-09-05T13:00:00.000Z',
        })
        .marcarVerificado({ ahora: '2026-09-05T14:00:00.000Z' });
      expect(s.estado).toBe('verificado');
      expect(s.kycResultado).toBe('approved');
    });

  it('vista pública no expone notas internas',
    () => {
      const s = basePendiente()
        .marcarSinVerificar({
          diditSessionId: 'sess_1',
          notasInternas: 'secreto',
          ahora: '2026-09-05T13:00:00.000Z',
        });
      const vista = s.toVistaPublica();
      expect(vista).not.toHaveProperty('notasInternas');
      expect(vista.estado).toBe('sin_verificar');
    });
});

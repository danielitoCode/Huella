import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSolicitudesModule } from '../../di/solicitudes.module';
import { InMemorySolicitudRepository } from '../../../../../infrastructure/testing/InMemorySolicitudRepository';
import type { KycProvider } from '../../domain/ports/KycProvider';
import type { EmailNotifier } from '../../domain/ports/EmailNotifier';

describe('MarcarSinVerificar (use case)', () => {
  let repo: InMemorySolicitudRepository;
  let kyc: KycProvider;
  let email: EmailNotifier;
  let module: ReturnType<typeof createSolicitudesModule>;

  beforeEach(() => {
    repo = new InMemorySolicitudRepository();
    kyc = {
      createSession: vi.fn(async () => ({
        sessionId: 'didit_sess_99',
        verificationUrl: 'https://verify.didit.me/s/99',
      })),
    };
    email = {
      sendTracking: vi.fn(async () => {}),
      sendKycLink: vi.fn(async () => {}),
      sendStatusUpdate: vi.fn(async () => {}),
    };
    module = createSolicitudesModule({
      repo,
      kyc,
      email,
      publicAppUrl: 'https://huella.app',
      idGenerator: () => 'sol-1',
      now: () => '2026-09-05T12:00:00.000Z',
    });
  });

  it('crea pendiente y al marcar sin verificar dispara KYC + email',
    async () => {
      await module.crearSolicitud({
        nombreFamiliar: 'Ana',
        email: 'ana@example.com',
        nombrePersona: 'Luis',
        relacion: 'Hermana',
        descripcion: 'Necesito ayuda',
      });

      const guardada = await repo.findById('sol-1');
      expect(guardada?.estado).toBe('pendiente');

      const result = await module.marcarSinVerificar({ solicitudId: 'sol-1' });

      expect(result.estado).toBe('sin_verificar');
      expect(result.diditSessionId).toBe('didit_sess_99');
      expect(kyc.createSession).toHaveBeenCalled();
      expect(email.sendKycLink).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ana@example.com',
          verificationUrl: 'https://verify.didit.me/s/99',
        }),
      );
    });

  it('marcar verificado tras KYC approved',
    async () => {
      await module.crearSolicitud({
        nombreFamiliar: 'Ana',
        email: 'ana@example.com',
        nombrePersona: 'Luis',
        relacion: 'Hermana',
        descripcion: 'Necesito ayuda',
      });
      await module.marcarSinVerificar({ solicitudId: 'sol-1' });

      const v = await module.marcarVerificado({ diditSessionId: 'didit_sess_99' });
      expect(v.estado).toBe('verificado');
    });
});

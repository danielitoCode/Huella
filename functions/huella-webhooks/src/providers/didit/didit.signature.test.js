import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyDiditSignatureV2 } from './didit.signature.js';

function sign(body, secret) {
  // Misma canonicalización que la implementación (sortKeys + shortenFloats internos)
  // Para el test usamos el body ya simple y firmamos el JSON canónico del verify
  const canonical = JSON.stringify(
    Object.keys(body)
      .sort()
      .reduce((acc, k) => {
        acc[k] = body[k];
        return acc;
      }, {}),
  );
  return createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');
}

describe('verifyDiditSignatureV2', () => {
  const secret = 'test-webhook-secret';
  const body = { session_id: 'sess_1', status: 'Approved', event_id: 'evt_1' };
  const timestamp = String(Math.floor(Date.now() / 1000));

  it('acepta firma válida y timestamp fresco', () => {
    const signatureV2 = sign(body, secret);
    expect(
      verifyDiditSignatureV2({
        bodyJson: body,
        signatureV2,
        timestamp,
        secret,
      }),
    ).toBe(true);
  });

  it('rechaza firma incorrecta', () => {
    expect(
      verifyDiditSignatureV2({
        bodyJson: body,
        signatureV2: 'deadbeef',
        timestamp,
        secret,
      }),
    ).toBe(false);
  });

  it('rechaza timestamp fuera de ventana 300s', () => {
    const signatureV2 = sign(body, secret);
    const old = String(Math.floor(Date.now() / 1000) - 400);
    expect(
      verifyDiditSignatureV2({
        bodyJson: body,
        signatureV2,
        timestamp: old,
        secret,
      }),
    ).toBe(false);
  });

  it('rechaza sin secret o sin signature', () => {
    expect(
      verifyDiditSignatureV2({
        bodyJson: body,
        signatureV2: '',
        timestamp,
        secret,
      }),
    ).toBe(false);
  });
});

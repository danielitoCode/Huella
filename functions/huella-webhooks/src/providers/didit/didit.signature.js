import { createHmac, timingSafeEqual } from 'node:crypto';

function shortenFloats(value) {
  if (Array.isArray(value)) return value.map(shortenFloats);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = shortenFloats(v);
    return out;
  }
  if (typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value) {
    return Math.floor(value);
  }
  return value;
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) {
      out[k] = sortKeys(value[k]);
    }
    return out;
  }
  return value;
}

/** X-Signature-V2 + X-Timestamp (ventana 300s) */
export function verifyDiditSignatureV2({ rawBody, bodyJson, signatureV2, timestamp, secret }) {
  if (!signatureV2 || !timestamp || !secret) return false;

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  let payload = bodyJson;
  if (!payload) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return false;
    }
  }

  const canonical = JSON.stringify(sortKeys(shortenFloats(payload)));
  const expected = createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');

  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(signatureV2), 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

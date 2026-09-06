import { describe, it, expect } from 'vitest';
import { ok, fail } from './response.js';

describe('response helpers', () => {
  it('ok envuelve data', () => {
    expect(ok({ a: 1 })).toEqual({ success: true, data: { a: 1 } });
  });

  it('fail envuelve error', () => {
    expect(fail('X', 'msg')).toEqual({
      success: false,
      error: { code: 'X', message: 'msg' },
    });
  });
});

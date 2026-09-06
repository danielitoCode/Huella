import { describe, it, expect } from 'vitest';
import { ApiError, isApiSuccess, type ApiResponse } from './types';

describe('ApiError / isApiSuccess', () => {
  it('ApiError expone code', () => {
    const err = new ApiError('NOT_FOUND', 'no existe', 404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('no existe');
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
  });

  it('isApiSuccess discrimina', () => {
    const ok: ApiResponse<{ a: number }> = { success: true, data: { a: 1 } };
    const fail: ApiResponse<{ a: number }> = {
      success: false,
      error: { code: 'X', message: 'y' },
    };
    expect(isApiSuccess(ok)).toBe(true);
    expect(isApiSuccess(fail)).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './types';

const createExecution = vi.fn();

vi.mock('./client', () => ({
  getFunctions: () => ({ createExecution }),
  getPublicConfig: () => ({
    endpoint: 'https://example.appwrite.io/v1',
    projectId: 'proj',
    databaseId: 'huella',
    collectionSolicitudesId: 'solicitudes',
    functionApiId: 'huella-api',
    publicAppUrl: 'http://localhost:5173',
  }),
}));

describe('executeApi', () => {
  beforeEach(() => {
    createExecution.mockReset();
  });

  it('devuelve data cuando success=true', async () => {
    createExecution.mockResolvedValue({
      status: 'completed',
      responseStatusCode: 200,
      responseBody: JSON.stringify({ success: true, data: { codigo: 'HUE-2026-AB23CD' } }),
    });

    const { executeApi } = await import('./executeApi');
    const data = await executeApi<{ codigo: string }>('solicitudes.getByCode', {
      codigo: 'HUE-2026-AB23CD',
    });

    expect(data.codigo).toBe('HUE-2026-AB23CD');
    expect(createExecution).toHaveBeenCalledOnce();
    const arg = createExecution.mock.calls[0][0];
    expect(arg.functionId).toBe('huella-api');
    expect(JSON.parse(arg.body)).toEqual({
      action: 'solicitudes.getByCode',
      payload: { codigo: 'HUE-2026-AB23CD' },
    });
  });

  it('lanza ApiError cuando success=false', async () => {
    createExecution.mockResolvedValue({
      status: 'completed',
      responseStatusCode: 404,
      responseBody: JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Solicitud no encontrada' },
      }),
    });

    const { executeApi } = await import('./executeApi');
    await expect(executeApi('solicitudes.getByCode', { codigo: 'HUE-2026-XXXXXX' })).rejects.toMatchObject({
      name: 'ApiError',
      code: 'NOT_FOUND',
    });
  });

  it('executeApiSafe no lanza', async () => {
    createExecution.mockResolvedValue({
      status: 'completed',
      responseBody: JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'no' },
      }),
    });

    const { executeApiSafe } = await import('./executeApi');
    const res = await executeApiSafe('solicitudes.getByCode', {});
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.code).toBe('NOT_FOUND');
  });

  it('rechaza action vacía', async () => {
    const { executeApi } = await import('./executeApi');
    await expect(executeApi('')).rejects.toBeInstanceOf(ApiError);
  });
});

import { ExecutionMethod } from 'appwrite';
import { getFunctions, getPublicConfig } from '../../appwrite/client';
import { ApiError, type ApiResponse } from '../../appwrite/types';
import type { ApiTransport } from './ApiTransport';

/**
 * Implementación legacy paralela.
 * Se conserva para migración gradual y compatibilidad con Appwrite Functions.
 */
export class AppwriteFunctionApiTransport implements ApiTransport {
  constructor(private readonly functionId = getPublicConfig().functionApiId) {
    if (!functionId) throw new Error('VITE_APPWRITE_FUNCTION_API_ID no está configurada.');
  }

  async execute<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    const execution = await getFunctions().createExecution(
      this.functionId,
      JSON.stringify({ action, payload }),
      false,
      '/',
      ExecutionMethod.POST,
      { 'Content-Type': 'application/json' },
    );

    if (execution.status === 'failed') {
      throw new ApiError(
        'EXECUTION_FAILED',
        execution.errors || 'La Appwrite Function falló.',
        execution.responseStatusCode,
      );
    }

    let parsed: ApiResponse<T>;
    try {
      parsed = JSON.parse(execution.responseBody || '{}') as ApiResponse<T>;
    } catch {
      throw new ApiError('INVALID_RESPONSE', 'La Function no devolvió JSON válido.');
    }

    if (!parsed.success) {
      throw new ApiError(
        parsed.error?.code ?? 'API_ERROR',
        parsed.error?.message ?? 'Error en la API',
        execution.responseStatusCode,
      );
    }
    return parsed.data;
  }
}

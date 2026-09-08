import { getAccount, getPublicConfig } from '../../appwrite/client';
import { ApiError, type ApiResponse } from '../../appwrite/types';
import type { ApiTransport } from './ApiTransport';

async function getJwt(): Promise<string | null> {
  try {
    return (await getAccount().createJWT()).jwt || null;
  } catch {
    return null;
  }
}

/**
 * Transporte HTTP hacia Cloudflare Worker.
 * No conoce casos de uso ni UI: solo ejecuta el contrato canónico
 * POST { action, payload } y devuelve data.
 */
export class WorkerApiTransport implements ApiTransport {
  constructor(private readonly baseUrl = getPublicConfig().apiBaseUrl) {
    if (!baseUrl) throw new Error('VITE_API_BASE_URL no está configurada.');
  }

  async execute<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    const jwt = await getJwt();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) headers.Authorization = `Bearer ${jwt}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, payload }),
      });
    } catch (error) {
      throw new ApiError(
        'NETWORK',
        error instanceof Error ? error.message : 'No se pudo conectar con el Worker.',
      );
    }

    const raw = await response.text();
    let parsed: ApiResponse<T>;
    try {
      parsed = JSON.parse(raw || '{}') as ApiResponse<T>;
    } catch {
      throw new ApiError('INVALID_RESPONSE', `HTTP ${response.status}: respuesta no JSON`, response.status);
    }

    if (!parsed || typeof parsed.success !== 'boolean') {
      throw new ApiError('INVALID_RESPONSE', 'Formato de respuesta inesperado', response.status);
    }
    if (!parsed.success) {
      throw new ApiError(
        parsed.error?.code ?? 'API_ERROR',
        parsed.error?.message ?? 'Error en la API',
        response.status,
      );
    }

    return parsed.data;
  }
}

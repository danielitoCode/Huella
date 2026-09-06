import { getFunctions, getPublicConfig } from './client';
import { ApiError, type ApiResponse } from './types';

export type ExecuteApiOptions = {
  /** ID de function; por defecto VITE_APPWRITE_FUNCTION_API_ID */
  functionId?: string;
};

/**
 * Invoca huella-api: POST { action, payload }.
 * Parsea responseBody y lanza ApiError si success === false o la ejecución falla.
 */
export async function executeApi<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  options: ExecuteApiOptions = {},
): Promise<T> {
  if (!action || typeof action !== 'string') {
    throw new ApiError('INVALID_ACTION', 'action es requerida');
  }

  const config = getPublicConfig();
  const functionId = options.functionId ?? config.functionApiId;
  const functions = getFunctions();

  const body = JSON.stringify({ action, payload });

  let execution: {
    status: string;
    responseStatusCode?: number;
    responseBody?: string;
    errors?: string;
  };

  try {
    // SDK Appwrite 18+: createExecution con objeto
    execution = (await functions.createExecution({
      functionId,
      body,
      async: false,
      path: '/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })) as typeof execution;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al ejecutar la function';
    throw new ApiError('EXECUTION_FAILED', message);
  }

  if (execution.status === 'failed') {
    throw new ApiError(
      'EXECUTION_FAILED',
      execution.errors || 'La function falló sin detalle',
      execution.responseStatusCode,
    );
  }

  const raw = execution.responseBody ?? '';
  let parsed: ApiResponse<T>;
  try {
    parsed = JSON.parse(raw || '{}') as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'INVALID_RESPONSE',
      'La function no devolvió JSON válido',
      execution.responseStatusCode,
    );
  }

  if (!parsed || typeof parsed !== 'object' || typeof (parsed as ApiResponse<T>).success !== 'boolean') {
    throw new ApiError('INVALID_RESPONSE', 'Formato de respuesta inesperado');
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

/** Variante que no lanza: útil en UI para mostrar errores. */
export async function executeApiSafe<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  options: ExecuteApiOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const data = await executeApi<T>(action, payload, options);
    return { success: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: { code: err.code, message: err.message } };
    }
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Error desconocido',
      },
    };
  }
}

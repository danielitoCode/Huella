import { ExecutionMethod } from 'appwrite';
import { getFunctions, getPublicConfig } from './client';
import { ApiError, type ApiResponse } from './types';
import { addDevLog } from '../stores/devLogger';

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
  const startTime = performance.now();

  addDevLog({
    type: 'api_req',
    title: `POST ${action}`,
    action,
    payload,
  });

  let execution: {
    status: string;
    responseStatusCode?: number;
    responseBody?: string;
    errors?: string;
  };

  try {
    execution = (await functions.createExecution(
      functionId,
      body,
      false,
      '/',
      ExecutionMethod.POST,
      { 'Content-Type': 'application/json' },
    )) as typeof execution;
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : 'Error al ejecutar la function';

    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (${message})`,
      action,
      latencyMs,
      payload,
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });

    throw new ApiError('EXECUTION_FAILED', message);
  }

  const latencyMs = Math.round(performance.now() - startTime);

  if (execution.status === 'failed') {
    const errText = execution.errors || 'La function falló sin detalle';

    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (Status ${execution.responseStatusCode || 500})`,
      action,
      latencyMs,
      payload,
      error: errText,
    });

    throw new ApiError(
      'EXECUTION_FAILED',
      errText,
      execution.responseStatusCode,
    );
  }

  const raw = execution.responseBody ?? '';
  let parsed: ApiResponse<T>;
  try {
    parsed = JSON.parse(raw || '{}') as ApiResponse<T>;
  } catch {
    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (JSON Inválido)`,
      action,
      latencyMs,
      payload,
      response: raw,
    });

    throw new ApiError(
      'INVALID_RESPONSE',
      'La function no devolvió JSON válido',
      execution.responseStatusCode,
    );
  }

  if (!parsed || typeof parsed !== 'object' || typeof (parsed as ApiResponse<T>).success !== 'boolean') {
    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (Formato Inesperado)`,
      action,
      latencyMs,
      payload,
      response: parsed,
    });

    throw new ApiError('INVALID_RESPONSE', 'Formato de respuesta inesperado');
  }

  if (!parsed.success) {
    const code = parsed.error?.code ?? 'API_ERROR';
    const message = parsed.error?.message ?? 'Error en la API';

    addDevLog({
      type: 'api_err',
      title: `ERR ${action} [${code}]: ${message}`,
      action,
      latencyMs,
      payload,
      error: parsed.error,
    });

    throw new ApiError(code, message, execution.responseStatusCode);
  }

  addDevLog({
    type: 'api_res',
    title: `SUCCESS ${action}`,
    action,
    latencyMs,
    payload,
    response: parsed.data,
  });

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

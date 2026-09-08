import { ExecutionMethod } from 'appwrite';
import { getAccount, getFunctions, getPublicConfig } from './client';
import { ApiError, type ApiResponse } from './types';
import { addDevLog } from '../stores/devLogger';

export type ExecuteApiOptions = {
  functionId?: string;
};

async function getJwtIfSession(): Promise<string | null> {
  try {
    const account = getAccount();
    const jwt = await account.createJWT();
    return jwt?.jwt || null;
  } catch {
    return null;
  }
}

/** Backend en Render (HTTP). */
async function executeViaRender<T>(
  baseUrl: string,
  action: string,
  payload: Record<string, unknown>,
  startTime: number,
): Promise<T> {
  const jwt = await getJwtIfSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, payload }),
    });
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : 'Red / CORS hacia la API';
    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (${message})`,
      action,
      latencyMs,
      payload,
      error: message,
    });
    throw new ApiError('NETWORK', message);
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const raw = await res.text();
  let parsed: ApiResponse<T>;
  try {
    parsed = JSON.parse(raw || '{}') as ApiResponse<T>;
  } catch {
    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (JSON inválido · HTTP ${res.status})`,
      action,
      latencyMs,
      payload,
      response: raw.slice(0, 500),
    });
    throw new ApiError('INVALID_RESPONSE', `HTTP ${res.status}: respuesta no JSON`, res.status);
  }

  if (!parsed || typeof parsed.success !== 'boolean') {
    addDevLog({
      type: 'api_err',
      title: `FAIL ${action} (formato inesperado)`,
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
    throw new ApiError(code, message, res.status);
  }

  addDevLog({
    type: 'api_res',
    title: `SUCCESS ${action}`,
    action,
    latencyMs,
    payload,
    response: parsed.data,
  });

  return parsed.data as T;
}

/** Legacy: Appwrite Functions (solo si no hay VITE_API_BASE_URL). */
async function executeViaAppwriteFunction<T>(
  action: string,
  payload: Record<string, unknown>,
  functionId: string,
  startTime: number,
): Promise<T> {
  const functions = getFunctions();
  const body = JSON.stringify({ action, payload });

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
    throw new ApiError('EXECUTION_FAILED', errText, execution.responseStatusCode);
  }

  const raw = execution.responseBody ?? '';
  let parsed: ApiResponse<T>;
  try {
    parsed = JSON.parse(raw || '{}') as ApiResponse<T>;
  } catch {
    throw new ApiError('INVALID_RESPONSE', 'La function no devolvió JSON válido');
  }

  if (!parsed?.success) {
    throw new ApiError(
      parsed?.error?.code ?? 'API_ERROR',
      parsed?.error?.message ?? 'Error en la API',
      execution.responseStatusCode,
    );
  }

  addDevLog({
    type: 'api_res',
    title: `SUCCESS ${action}`,
    action,
    latencyMs,
    payload,
    response: parsed.data,
  });

  return parsed.data as T;
}

/**
 * Invoca la API de Huella: POST { action, payload }.
 * Preferencia: Render (VITE_API_BASE_URL). Fallback: Appwrite Function.
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
  const startTime = performance.now();

  addDevLog({
    type: 'api_req',
    title: `POST ${action}`,
    action,
    payload,
  });

  if (config.apiBaseUrl) {
    return executeViaRender<T>(config.apiBaseUrl, action, payload, startTime);
  }

  const functionId = options.functionId ?? config.functionApiId;
  return executeViaAppwriteFunction<T>(action, payload, functionId, startTime);
}

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

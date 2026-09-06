/**
 * Store y sistema de trazabilidad de Logs en Tiempo Real para Desarrollo.
 * Intercepta: Red (fetch/Appwrite SDK), Functions API, Console.error/warn y Excepciones.
 * Solo activo cuando import.meta.env.DEV === true.
 */
import { writable } from 'svelte/store';

export type LogType = 'api_req' | 'api_res' | 'api_err' | 'net_req' | 'net_res' | 'net_err' | 'error' | 'warn' | 'info';

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: LogType;
  title: string;
  page?: string;
  method?: string;
  url?: string;
  status?: number | string;
  reason?: string;
  action?: string;
  latencyMs?: number;
  payload?: unknown;
  response?: unknown;
  error?: unknown;
  stack?: string;
};

export const devLogs = writable<LogEntry[]>([]);
export const unreadErrorCount = writable<number>(0);

/** Añade un registro al panel de logs */
export function addDevLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
  if (!import.meta.env.DEV) return;

  const page = typeof window !== 'undefined' ? window.location.hash || window.location.pathname : '';

  const newLog: LogEntry = {
    page,
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date(),
  };

  devLogs.update((logs) => [newLog, ...logs.slice(0, 299)]); // Limite de 300 logs en memoria

  if (entry.type === 'api_err' || entry.type === 'net_err' || entry.type === 'error') {
    unreadErrorCount.update((n) => n + 1);
  }
}

/** Limpia todos los logs acumulados */
export function clearDevLogs() {
  devLogs.set([]);
  unreadErrorCount.set(0);
}

/** Formatea todos los logs como texto Markdown para copiar rápidamente */
export function formatLogsForClipboard(logs: LogEntry[]): string {
  if (logs.length === 0) return 'No hay logs registrados.';

  return logs
    .map((log) => {
      const time = log.timestamp.toISOString();
      const typeStr = log.type.toUpperCase();
      let res = `[${time}] [${typeStr}] ${log.title}`;
      if (log.page) res += `\nPágina: ${log.page}`;
      if (log.method && log.url) res += `\nPetición: ${log.method} ${log.url}`;
      if (log.status) res += `\nEstado: ${log.status}`;
      if (log.reason) res += `\nRazón / Detalle: ${log.reason}`;
      if (log.latencyMs !== undefined) res += `\nLatencia: ${log.latencyMs}ms`;
      if (log.payload !== undefined) res += `\nPayload:\n${JSON.stringify(log.payload, null, 2)}`;
      if (log.response !== undefined) res += `\nRespuesta:\n${JSON.stringify(log.response, null, 2)}`;
      if (log.error !== undefined) res += `\nError:\n${JSON.stringify(log.error, null, 2)}`;
      if (log.stack) res += `\nStack Trace:\n${log.stack}`;
      return res;
    })
    .join('\n\n----------------------------------------\n\n');
}

// INTERCEPTOR UNIVERSAL RED (fetch) Y CONSOLA (solo en desarrollo)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // 1. Interceptar fetch nativo (utilizado por el Web SDK de Appwrite, REST APIs, etc.)
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const input = args[0];
    const init = args[1];

    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || 'GET').toUpperCase();
    const startTime = performance.now();

    // Extraer payload si existe
    let payload: unknown = undefined;
    if (init?.body) {
      try {
        if (typeof init.body === 'string') {
          payload = JSON.parse(init.body);
          // Enmascarar contraseñas en el payload logueado por seguridad visual
          if (payload && typeof payload === 'object') {
            const p = { ...payload } as Record<string, unknown>;
            if (p.password) p.password = '••••••••';
            payload = p;
          }
        } else {
          payload = String(init.body);
        }
      } catch {
        payload = init.body;
      }
    }

    // Nombre simplificado del endpoint (ej. /account/sessions/email)
    let cleanUrlName = url;
    try {
      const parsedUrl = new URL(url);
      cleanUrlName = parsedUrl.pathname;
    } catch {
      // url relativa
    }

    addDevLog({
      type: 'net_req',
      title: `${method} ${cleanUrlName}`,
      method,
      url,
      payload,
    });

    try {
      const response = await originalFetch.apply(this, args);
      const latencyMs = Math.round(performance.now() - startTime);

      // Clonar response para leer body sin consumir la respuesta original
      const clone = response.clone();
      let responseData: unknown = undefined;
      try {
        const text = await clone.text();
        responseData = JSON.parse(text);
      } catch {
        // no es JSON
      }

      if (!response.ok) {
        let reason = response.statusText || `HTTP Status ${response.status}`;
        if (responseData && typeof responseData === 'object') {
          const resObj = responseData as Record<string, unknown>;
          if (resObj.message) reason = String(resObj.message);
          if (resObj.type) reason += ` (${resObj.type})`;
        }

        addDevLog({
          type: 'net_err',
          title: `FAIL ${method} ${cleanUrlName} (${response.status})`,
          method,
          url,
          status: response.status,
          reason,
          latencyMs,
          payload,
          response: responseData,
          error: responseData || reason,
        });
      } else {
        addDevLog({
          type: 'net_res',
          title: `OK ${method} ${cleanUrlName} (${response.status})`,
          method,
          url,
          status: response.status,
          latencyMs,
          payload,
          response: responseData,
        });
      }

      return response;
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      const errorMsg = err instanceof Error ? err.message : String(err);

      addDevLog({
        type: 'net_err',
        title: `ERR ${method} ${cleanUrlName} (Red / CORS / Desconectado)`,
        method,
        url,
        status: 'NETWORK_ERROR',
        reason: errorMsg,
        latencyMs,
        payload,
        error: errorMsg,
        stack: err instanceof Error ? err.stack : undefined,
      });

      throw err;
    }
  };

  // 2. Interceptar console.error y console.warn
  const origConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    origConsoleError.apply(console, args);

    const firstArg = args[0];
    const message = typeof firstArg === 'string' ? firstArg : firstArg instanceof Error ? firstArg.message : 'Console Error';

    addDevLog({
      type: 'error',
      title: `Console Error: ${message}`,
      error: args.length === 1 ? args[0] : args,
      stack: firstArg instanceof Error ? firstArg.stack : new Error().stack,
    });
  };

  const origConsoleWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    origConsoleWarn.apply(console, args);

    const firstArg = args[0];
    const message = typeof firstArg === 'string' ? firstArg : 'Console Warning';

    addDevLog({
      type: 'warn',
      title: `Console Warn: ${message}`,
      error: args.length === 1 ? args[0] : args,
    });
  };

  // 3. Interceptar Excepciones Globales
  window.addEventListener('error', (event) => {
    addDevLog({
      type: 'error',
      title: `Uncaught Error: ${event.message || 'Error Desconocido'}`,
      reason: event.message,
      error: event.error,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason instanceof Error ? event.reason.message : String(event.reason);
    addDevLog({
      type: 'error',
      title: `Promise Rejection: ${reasonMsg}`,
      reason: reasonMsg,
      error: event.reason,
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
  });
}

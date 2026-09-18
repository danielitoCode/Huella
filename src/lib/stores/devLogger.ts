/**
 * Store y sistema de trazabilidad de Logs en Tiempo Real para Desarrollo.
 *
 * Intercepta:
 * - Red (fetch / Appwrite SDK)
 * - Functions API
 * - console.error / console.warn
 * - Excepciones globales
 *
 * Solo activo cuando import.meta.env.DEV === true.
 */

import { writable } from 'svelte/store';

export type LogType =
    | 'api_req'
    | 'api_res'
    | 'api_err'
    | 'net_req'
    | 'net_res'
    | 'net_err'
    | 'error'
    | 'warn'
    | 'info';

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

/**
 * ---------------------------------------------------------------------------
 * Utilidades internas
 * ---------------------------------------------------------------------------
 */

const MAX_LOG_BODY_SIZE = 50_000;

/**
 * Convierte objetos Error a una estructura serializable.
 *
 * JSON.stringify(new Error("x")) normalmente produce "{}".
 * Por eso hacemos la conversión manual.
 */
function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause !== undefined
          ? { cause: serializeError(error.cause) }
          : {}),
    };
  }

  if (error === null || error === undefined) {
    return error;
  }

  if (typeof error === 'object') {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return String(error);
    }
  }

  return error;
}

/**
 * Intenta convertir un valor a JSON sin lanzar excepciones.
 */
function safeJsonParse(text: string): unknown {
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Enmascara información sensible antes de almacenarla en los logs.
 */
function sanitizePayload(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }

  const result = { ...(value as Record<string, unknown>) };

  const sensitiveKeys = [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'secret',
    'accessToken',
    'refreshToken',
    'token',
    'apiKey',
    'key',
  ];

  for (const key of sensitiveKeys) {
    if (key in result) {
      result[key] = '••••••••';
    }
  }

  return result;
}

/**
 * Evita almacenar cuerpos gigantes en memoria.
 */
function limitLogSize(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  try {
    const serialized = JSON.stringify(value);

    if (serialized.length <= MAX_LOG_BODY_SIZE) {
      return value;
    }

    return `${serialized.substring(0, MAX_LOG_BODY_SIZE)}... [TRUNCATED]`;
  } catch {
    return String(value);
  }
}

/**
 * Obtiene una representación segura del error.
 */
function safeError(error: unknown): unknown {
  return limitLogSize(serializeError(error));
}

/**
 * ---------------------------------------------------------------------------
 * Store
 * ---------------------------------------------------------------------------
 */

/**
 * Añade un registro al panel de logs.
 *
 * Importante:
 * Esta función nunca debería lanzar una excepción hacia el interceptor
 * de red. El logger no debe poder romper una petición HTTP.
 */
export function addDevLog(
    entry: Omit<LogEntry, 'id' | 'timestamp'>
) {
  if (!import.meta.env.DEV) return;

  try {
    const page =
        typeof window !== 'undefined'
            ? window.location.hash || window.location.pathname
            : '';

    const newLog: LogEntry = {
      page,
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
    };

    devLogs.update((logs) => [
      newLog,
      ...logs.slice(0, 299),
    ]);

    if (
        entry.type === 'api_err' ||
        entry.type === 'net_err' ||
        entry.type === 'error'
    ) {
      unreadErrorCount.update((n) => n + 1);
    }
  } catch (loggerError) {
    /**
     * El logger nunca debe interferir con la aplicación.
     *
     * Utilizamos console.warn directamente para evitar entrar en nuestro
     * propio interceptor de console.warn.
     */
    console.warn(
        '[devLogger] Error interno del logger:',
        loggerError
    );
  }
}

/**
 * Limpia todos los logs acumulados.
 */
export function clearDevLogs() {
  devLogs.set([]);
  unreadErrorCount.set(0);
}

/**
 * Formatea todos los logs como texto Markdown para copiar rápidamente.
 */
export function formatLogsForClipboard(
    logs: LogEntry[]
): string {
  if (logs.length === 0) {
    return 'No hay logs registrados.';
  }

  return logs
      .map((log) => {
        const time = log.timestamp.toISOString();
        const typeStr = log.type.toUpperCase();

        let res = `[${time}] [${typeStr}] ${log.title}`;

        if (log.page) {
          res += `\nPágina: ${log.page}`;
        }

        if (log.method && log.url) {
          res += `\nPetición: ${log.method} ${log.url}`;
        }

        if (log.status) {
          res += `\nEstado: ${log.status}`;
        }

        if (log.reason) {
          res += `\nRazón / Detalle: ${log.reason}`;
        }

        if (log.latencyMs !== undefined) {
          res += `\nLatencia: ${log.latencyMs}ms`;
        }

        if (log.payload !== undefined) {
          try {
            res += `\nPayload:\n${JSON.stringify(
                log.payload,
                null,
                2
            )}`;
          } catch {
            res += `\nPayload:\n[No serializable]`;
          }
        }

        if (log.response !== undefined) {
          try {
            res += `\nRespuesta:\n${JSON.stringify(
                log.response,
                null,
                2
            )}`;
          } catch {
            res += `\nRespuesta:\n[No serializable]`;
          }
        }

        if (log.error !== undefined) {
          try {
            res += `\nError:\n${JSON.stringify(
                log.error,
                null,
                2
            )}`;
          } catch {
            res += `\nError:\n[No serializable]`;
          }
        }

        if (log.stack) {
          res += `\nStack Trace:\n${log.stack}`;
        }

        return res;
      })
      .join(
          '\n\n----------------------------------------\n\n'
      );
}

/**
 * ---------------------------------------------------------------------------
 * INTERCEPTOR UNIVERSAL
 * ---------------------------------------------------------------------------
 *
 * Solo desarrollo.
 *
 * IMPORTANTE:
 * El interceptor conserva SIEMPRE el fetch original.
 *
 * El flujo es:
 *
 *   Appwrite SDK
 *       ↓
 *   window.fetch
 *       ↓
 *   logger
 *       ↓
 *   originalFetch
 *       ↓
 *   Appwrite
 *       ↓
 *   Response
 *       ↓
 *   logger
 *       ↓
 *   Appwrite SDK
 *
 * Nunca debemos devolver undefined accidentalmente.
 */

if (
    typeof window !== 'undefined' &&
    import.meta.env.DEV
) {
  /**
   * Usamos una propiedad global para evitar que Vite HMR
   * instale el interceptor varias veces.
   */
  const FETCH_INTERCEPTOR_KEY =
      '__DANIELITOCODE_DEVLOGGER_FETCH__';

  const GLOBAL_KEY =
      '__DANIELITOCODE_DEVLOGGER_GLOBALS__';

  type DevLoggerGlobalState = {
    fetchInstalled?: boolean;
    consoleInstalled?: boolean;
    eventsInstalled?: boolean;
    originalFetch?: typeof window.fetch;
    originalConsoleError?: typeof console.error;
    originalConsoleWarn?: typeof console.warn;
  };

  const globalState =
      (window as typeof window & {
        [GLOBAL_KEY]?: DevLoggerGlobalState;
      })[GLOBAL_KEY] ??
      {};

  (
      window as typeof window & {
        [GLOBAL_KEY]?: DevLoggerGlobalState;
      }
  )[GLOBAL_KEY] = globalState;

  /**
   * -------------------------------------------------------------------------
   * 1. FETCH
   * -------------------------------------------------------------------------
   */

  if (!globalState.fetchInstalled) {
    /**
     * Guardamos el fetch REAL.
     *
     * Esto es fundamental.
     */
    const originalFetch =
        globalState.originalFetch ??
        window.fetch.bind(window);

    globalState.originalFetch = originalFetch;

    const interceptedFetch = async (
        ...args: Parameters<typeof window.fetch>
    ): Promise<Response> => {
      const input = args[0];
      const init = args[1];

      /**
       * Resolver URL.
       */
      let url = '';

      try {
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = String(input);
        }
      } catch {
        url = '[unknown-url]';
      }

      /**
       * Resolver método.
       *
       * Si Appwrite utiliza un Request, el método puede estar
       * dentro del Request y no en init.
       */
      let method = 'GET';

      try {
        if (init?.method) {
          method = init.method.toUpperCase();
        } else if (input instanceof Request) {
          method = input.method.toUpperCase();
        }
      } catch {
        method = 'GET';
      }

      const startTime = performance.now();

      /**
       * Payload.
       */
      let payload: unknown = undefined;

      try {
        let body: BodyInit | null | undefined =
            init?.body;

        /**
         * Cuando fetch recibe un Request, el body no está
         * disponible directamente mediante init.body.
         *
         * No consumimos aquí el Request porque hacerlo podría
         * interferir con la petición.
         */
        if (body) {
          if (typeof body === 'string') {
            payload = sanitizePayload(
                safeJsonParse(body)
            );
          } else {
            payload = String(body);
          }
        }
      } catch (payloadError) {
        payload = `[Unable to inspect request body: ${String(
            payloadError
        )}]`;
      }

      payload = limitLogSize(payload);

      /**
       * Endpoint simplificado.
       *
       * Ejemplo:
       * https://nyc.cloud.appwrite.io/v1/account/sessions/email
       *
       * →
       * /v1/account/sessions/email
       */
      let cleanUrlName = url;

      try {
        const parsedUrl = new URL(
            url,
            window.location.origin
        );

        cleanUrlName = parsedUrl.pathname;
      } catch {
        // Mantener URL original.
      }

      /**
       * Log de petición.
       *
       * El logger está protegido para que un fallo suyo
       * NO impida ejecutar fetch.
       */
      try {
        addDevLog({
          type: 'net_req',
          title: `${method} ${cleanUrlName}`,
          method,
          url,
          payload,
        });
      } catch {
        // Nunca bloquear fetch por el logger.
      }

      /**
       * Ejecutamos el FETCH REAL.
       */
      try {
        const response = await originalFetch(
            ...args
        );

        const latencyMs = Math.round(
            performance.now() - startTime
        );

        /**
         * Clonamos el response.
         *
         * Así podemos leer el body sin consumir
         * el Response que necesita Appwrite.
         */
        let responseData: unknown = undefined;

        try {
          const clone = response.clone();

          const text = await clone.text();

          if (text) {
            responseData = limitLogSize(
                safeJsonParse(text)
            );
          }
        } catch {
          /**
           * Algunos responses pueden no tener un body
           * legible o pueden ser binarios.
           */
          responseData = undefined;
        }

        /**
         * HTTP ERROR
         */
        if (!response.ok) {
          let reason =
              response.statusText ||
              `HTTP Status ${response.status}`;

          if (
              responseData &&
              typeof responseData === 'object' &&
              !Array.isArray(responseData)
          ) {
            const responseObject =
                responseData as Record<
                    string,
                    unknown
                >;

            if (responseObject.message) {
              reason = String(
                  responseObject.message
              );
            }

            if (responseObject.type) {
              reason += ` (${String(
                  responseObject.type
              )})`;
            }
          }

          try {
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
          } catch {
            // Nunca romper la respuesta.
          }
        } else {
          /**
           * HTTP SUCCESS
           */
          try {
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
          } catch {
            // Nunca romper la respuesta.
          }
        }

        /**
         * MUY IMPORTANTE:
         *
         * Devolvemos el Response ORIGINAL.
         *
         * Appwrite SDK necesita este objeto.
         */
        return response;
      } catch (err) {
        /**
         * Aquí sí estamos ante un error real de fetch:
         *
         * - CORS bloqueado
         * - conexión perdida
         * - DNS
         * - navegador bloqueando la petición
         * - AbortController
         * - etc.
         */
        const latencyMs = Math.round(
            performance.now() - startTime
        );

        const errorMsg =
            err instanceof Error
                ? err.message
                : String(err);

        const serializedError =
            safeError(err);

        try {
          addDevLog({
            type: 'net_err',
            title: `ERR ${method} ${cleanUrlName} (Red / CORS / Desconectado)`,
            method,
            url,
            status: 'NETWORK_ERROR',
            reason: errorMsg,
            latencyMs,
            payload,
            error: serializedError,
            stack:
                err instanceof Error
                    ? err.stack
                    : undefined,
          });
        } catch {
          // Nunca ocultar el error real.
        }

        /**
         * MUY IMPORTANTE:
         *
         * Propagamos el error original.
         *
         * Appwrite necesita recibirlo.
         */
        throw err;
      }
    };

    /**
     * Marcamos el interceptor.
     */
    Object.defineProperty(
        interceptedFetch,
        FETCH_INTERCEPTOR_KEY,
        {
          value: true,
          configurable: false,
          enumerable: false,
        }
    );

    /**
     * Instalamos.
     */
    window.fetch = interceptedFetch as typeof window.fetch;

    globalState.fetchInstalled = true;
  }

  /**
   * -------------------------------------------------------------------------
   * 2. CONSOLE.ERROR
   * -------------------------------------------------------------------------
   */

  if (!globalState.consoleInstalled) {
    const originalConsoleError =
        globalState.originalConsoleError ??
        console.error.bind(console);

    const originalConsoleWarn =
        globalState.originalConsoleWarn ??
        console.warn.bind(console);

    globalState.originalConsoleError =
        originalConsoleError;

    globalState.originalConsoleWarn =
        originalConsoleWarn;

    console.error = (
        ...args: unknown[]
    ) => {
      /**
       * Primero mostrar en DevTools.
       */
      originalConsoleError(...args);

      try {
        const firstArg = args[0];

        const message =
            typeof firstArg === 'string'
                ? firstArg
                : firstArg instanceof Error
                    ? firstArg.message
                    : 'Console Error';

        const error =
            firstArg instanceof Error
                ? safeError(firstArg)
                : args.length === 1
                    ? safeError(firstArg)
                    : safeError(args);

        addDevLog({
          type: 'error',
          title: `Console Error: ${message}`,
          error,
          stack:
              firstArg instanceof Error
                  ? firstArg.stack
                  : new Error().stack,
        });
      } catch {
        /**
         * El logger jamás debe romper console.error.
         */
      }
    };

    console.warn = (
        ...args: unknown[]
    ) => {
      /**
       * Primero mostrar en DevTools.
       */
      originalConsoleWarn(...args);

      try {
        const firstArg = args[0];

        const message =
            typeof firstArg === 'string'
                ? firstArg
                : firstArg instanceof Error
                    ? firstArg.message
                    : 'Console Warning';

        const error =
            firstArg instanceof Error
                ? safeError(firstArg)
                : args.length === 1
                    ? safeError(firstArg)
                    : safeError(args);

        addDevLog({
          type: 'warn',
          title: `Console Warn: ${message}`,
          error,
          stack:
              firstArg instanceof Error
                  ? firstArg.stack
                  : undefined,
        });
      } catch {
        /**
         * El logger jamás debe romper console.warn.
         */
      }
    };

    globalState.consoleInstalled = true;
  }

  /**
   * -------------------------------------------------------------------------
   * 3. EXCEPCIONES GLOBALES
   * -------------------------------------------------------------------------
   */

  if (!globalState.eventsInstalled) {
    /**
     * JavaScript Error.
     */
    window.addEventListener(
        'error',
        (event) => {
          try {
            addDevLog({
              type: 'error',
              title: `Uncaught Error: ${
                  event.message ||
                  'Error Desconocido'
              }`,
              reason: event.message,
              error: safeError(event.error),
              stack: event.error?.stack,
            });
          } catch {
            // Nunca interferir con el navegador.
          }
        }
    );

    /**
     * Promise rejection no manejada.
     */
    window.addEventListener(
        'unhandledrejection',
        (event) => {
          try {
            const reasonMsg =
                event.reason instanceof Error
                    ? event.reason.message
                    : String(event.reason);

            addDevLog({
              type: 'error',
              title: `Promise Rejection: ${reasonMsg}`,
              reason: reasonMsg,
              error: safeError(event.reason),
              stack:
                  event.reason instanceof Error
                      ? event.reason.stack
                      : undefined,
            });
          } catch {
            // Nunca interferir con el navegador.
          }
        }
    );

    globalState.eventsInstalled = true;
  }
}

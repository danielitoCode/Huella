import { getPublicConfig } from '../../appwrite/client';
import { AppwriteFunctionApiTransport } from './AppwriteFunctionApiTransport';
import type { ApiTransport } from './ApiTransport';
import { WorkerApiTransport } from './WorkerApiTransport';

/**
 * Selección centralizada del transporte.
 * Worker es la ruta principal cuando VITE_API_BASE_URL existe.
 * Las Functions permanecen intactas como implementación legacy/fallback.
 */
export function createApiTransport(): ApiTransport {
  const config = getPublicConfig();
  if (config.apiBaseUrl) return new WorkerApiTransport(config.apiBaseUrl);
  return new AppwriteFunctionApiTransport(config.functionApiId);
}

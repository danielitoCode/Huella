import { Client, Account, Databases, Functions } from 'appwrite';
import { getAppwriteConfig, type AppwritePublicConfig } from './config';

let clientSingleton: Client | null = null;
let configSnapshot: AppwritePublicConfig | null = null;

/**
 * Cliente Appwrite Web SDK (singleton).
 * Solo datos públicos VITE_*; nunca API keys de servidor.
 */
export function getClient(): Client {
  if (clientSingleton) return clientSingleton;

  const config = getAppwriteConfig();
  configSnapshot = config;

  const client = new Client().setEndpoint(config.endpoint).setProject(config.projectId);

  // Dev Key opcional (local): reduce límites de abuso / CORS en desarrollo.
  if (config.devKey && typeof (client as Client & { setDevKey?: (k: string) => Client }).setDevKey === 'function') {
    (client as Client & { setDevKey: (k: string) => Client }).setDevKey(config.devKey);
  }

  clientSingleton = client;
  return client;
}

export function getAccount(): Account {
  return new Account(getClient());
}

export function getDatabases(): Databases {
  return new Databases(getClient());
}

export function getFunctions(): Functions {
  return new Functions(getClient());
}

export function getPublicConfig(): AppwritePublicConfig {
  if (configSnapshot) return configSnapshot;
  return getAppwriteConfig();
}

/** Solo para tests: reinicia el singleton. */
export function __resetAppwriteClientForTests(): void {
  clientSingleton = null;
  configSnapshot = null;
}

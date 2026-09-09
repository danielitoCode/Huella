import { Client, Databases, Users, Account, ID, Query } from 'node-appwrite';
import type { Env } from './env';
import { dbIds } from './env';

function requireAppwriteConfig(env: Env) {
  const endpoint = String(env.APPWRITE_ENDPOINT || '').trim();
  const projectId = String(env.APPWRITE_PROJECT_ID || '').trim();
  const apiKey = String(env.APPWRITE_API_KEY || '').trim();

  if (!endpoint) {
    throw Object.assign(
      new Error(
        'Falta secret APPWRITE_ENDPOINT en el Worker (ej. https://fra.cloud.appwrite.io/v1)',
      ),
      { code: 'CONFIG', status: 500 },
    );
  }
  try {
    // eslint-disable-next-line no-new
    new URL(endpoint);
  } catch {
    throw Object.assign(
      new Error(`APPWRITE_ENDPOINT inválido: "${endpoint}". Debe ser una URL absoluta con /v1`),
      { code: 'CONFIG', status: 500 },
    );
  }
  if (!projectId) {
    throw Object.assign(new Error('Falta secret APPWRITE_PROJECT_ID en el Worker'), {
      code: 'CONFIG',
      status: 500,
    });
  }
  if (!apiKey) {
    throw Object.assign(new Error('Falta secret APPWRITE_API_KEY en el Worker'), {
      code: 'CONFIG',
      status: 500,
    });
  }
  return { endpoint, projectId, apiKey };
}

export function adminClient(env: Env) {
  const { endpoint, projectId, apiKey } = requireAppwriteConfig(env);
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return {
    client,
    databases: new Databases(client),
    users: new Users(client),
    ID,
    Query,
    ids: dbIds(env),
  };
}

/** Valida JWT de sesión Appwrite (emitido por el front). */
export async function userFromJwt(env: Env, jwt: string) {
  const { endpoint, projectId } = requireAppwriteConfig(env);
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setJWT(jwt);
  const account = new Account(client);
  return account.get();
}

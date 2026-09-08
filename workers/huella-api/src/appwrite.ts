import { Client, Databases, Users, Account, ID, Query } from 'node-appwrite';
import type { Env } from './env';
import { dbIds } from './env';

export function adminClient(env: Env) {
  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);
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
  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setJWT(jwt);
  const account = new Account(client);
  return account.get();
}

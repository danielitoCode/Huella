/**
 * Port de list_users/src/infrastructure/appwrite/usersGateway.js
 * Auth del solicitante SOLO por JWT (Account.get).
 * CRUD de usuarios con API key (Users).
 */
import { Account, Client, Users, ID } from 'node-appwrite';
import type { Env } from '../env';

export type AppwriteConfig = {
  endpoint: string;
  projectId: string;
  apiKey: string;
};

export function getAppwriteConfig(env: Env): AppwriteConfig {
  const endpoint = env.APPWRITE_ENDPOINT;
  const projectId = env.APPWRITE_PROJECT_ID;
  const apiKey = env.APPWRITE_API_KEY;
  if (!endpoint || !projectId || !apiKey) {
    throw Object.assign(new Error('Faltan APPWRITE_ENDPOINT / PROJECT_ID / API_KEY'), {
      code: 'CONFIG',
      status: 500,
    });
  }
  return { endpoint, projectId, apiKey };
}

const createAdminClient = (config: AppwriteConfig) =>
  new Client().setEndpoint(config.endpoint).setProject(config.projectId).setKey(config.apiKey);

const createUserClientFromJwt = (config: AppwriteConfig, jwt: string) =>
  new Client().setEndpoint(config.endpoint).setProject(config.projectId).setJWT(jwt);

export function createAppwriteUsersGateway(config: AppwriteConfig) {
  const adminClient = createAdminClient(config);
  const users = new Users(adminClient);

  return {
    users,
    ID,

    /** Como list_users: preferir JWT; no confiar en userId suelto. */
    async getRequester({ requesterJwt }: { requesterJwt?: string | null }) {
      if (!requesterJwt) return { requesterId: null as string | null, requester: null };

      const userClient = createUserClientFromJwt(config, requesterJwt);
      const account = new Account(userClient);
      const requester = await account.get();
      return { requesterId: requester?.$id ?? null, requester };
    },

    async list({ search }: { search?: string } = {}) {
      return users.list(undefined, search);
    },

    async get(userId: string) {
      return users.get(userId);
    },

    async create(input: {
      email: string;
      password: string;
      name: string;
      labels?: string[];
    }) {
      const created = await users.create(
        ID.unique(),
        input.email,
        undefined,
        input.password,
        input.name,
      );
      if (Array.isArray(input.labels) && input.labels.length) {
        await users.updateLabels(created.$id, input.labels);
      }
      return users.get(created.$id);
    },

    async updatePassword(userId: string, password: string) {
      await users.updatePassword(userId, password);
      return users.get(userId);
    },

    async updateStatus(userId: string, status: boolean) {
      await users.updateStatus(userId, status);
      return users.get(userId);
    },

    async updateLabels(userId: string, labels: string[]) {
      await users.updateLabels(userId, labels);
      return users.get(userId);
    },

    async delete(userId: string) {
      return users.delete(userId);
    },
  };
}

export type UsersGateway = ReturnType<typeof createAppwriteUsersGateway>;

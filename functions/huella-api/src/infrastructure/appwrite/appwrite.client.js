import { Client, Databases, Users, ID, Query } from 'node-appwrite';

export function createAdminClient(req) {
  const endpoint =
    process.env.APPWRITE_ENDPOINT ||
    process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const projectId =
    process.env.APPWRITE_PROJECT_ID ||
    process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const key =
    process.env.APPWRITE_API_KEY ||
    req?.headers?.['x-appwrite-key'];

  if (!endpoint || !projectId || !key) {
    throw new Error('Appwrite client misconfigured: missing endpoint/project/key');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(key);
  return {
    client,
    databases: new Databases(client),
    users: new Users(client),
    ID,
    Query,
  };
}

export function dbIds() {
  return {
    databaseId: process.env.APPWRITE_DATABASE_ID || 'huella',
    solicitudesId: process.env.APPWRITE_COLLECTION_SOLICITUDES_ID || 'solicitudes',
    kycId: process.env.APPWRITE_COLLECTION_KYC_ID || 'kyc_verifications',
  };
}

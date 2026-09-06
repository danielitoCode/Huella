export {
  getClient,
  getAccount,
  getDatabases,
  getFunctions,
  getPublicConfig,
  __resetAppwriteClientForTests,
} from './client';

export { getAppwriteConfig, isAppwriteConfigured, type AppwritePublicConfig } from './config';

export { executeApi, executeApiSafe, type ExecuteApiOptions } from './executeApi';

export {
  ApiError,
  isApiSuccess,
  type ApiResponse,
  type ApiSuccess,
  type ApiFailure,
} from './types';

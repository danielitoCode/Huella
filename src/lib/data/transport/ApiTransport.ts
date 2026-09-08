export interface ApiTransport {
  execute<T = unknown>(action: string, payload?: Record<string, unknown>): Promise<T>;
}

export type ApiTransportKind = 'worker' | 'appwrite-function';

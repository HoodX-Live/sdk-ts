import { createClient } from './generated/client';
import type { Client } from './generated/client';

const SESSION_HEADER = 'X-Session-Token';
const SESSION_PATH = '/api/app/v1/auth/session';

export interface SessionTokenStore {
  delete(): Promise<void>;
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
}

export interface HoodxClientOptions {
  baseUrl: string;
  sessionTokenStore: SessionTokenStore;
}

export function createHoodxClient({
  baseUrl,
  sessionTokenStore,
}: HoodxClientOptions): Client {
  const client = createClient({
    baseUrl: normalizeBaseUrl(baseUrl),
  });

  client.interceptors.request.use(async (request) => {
    const sessionToken = await sessionTokenStore.get();
    if (!sessionToken) {
      return request;
    }

    const headers = new Headers(request.headers);
    headers.set(SESSION_HEADER, sessionToken);
    return new Request(request, { headers });
  });

  client.interceptors.response.use(async (response, request) => {
    const sessionToken = await responseSessionToken(response);
    if (sessionToken) {
      await sessionTokenStore.set(sessionToken);
    } else if (
      request.url.endsWith(SESSION_PATH) &&
      (request.method === 'DELETE' ||
        response.status === 401 ||
        response.status === 410)
    ) {
      await sessionTokenStore.delete();
    }

    return response;
  });

  return client;
}

function normalizeBaseUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (url.username || url.password || url.search || url.hash) {
    throw new TypeError(
      'HoodX API base URL must not contain credentials, query, or hash',
    );
  }
  return url.toString().replace(/\/$/, '');
}

async function responseSessionToken(
  response: Response,
): Promise<string | null> {
  const contentType = response.headers.get('Content-Type');
  if (!contentType?.includes('json')) {
    return null;
  }

  const body: unknown = await response.clone().json();
  if (!isRecord(body) || !isRecord(body.meta)) {
    return null;
  }

  return typeof body.meta.session_token === 'string'
    ? body.meta.session_token
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

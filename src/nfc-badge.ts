import { getClient } from './client.js';
import type { Client } from './generated/client/index.js';
import type { SignedCredential } from './generated/types.gen.js';

export type CreateBackendSignedCredentialInput = {
  userId?: string;
  kind?: 'resident' | 'guest';
  expiresInSeconds: number;
};

type GoogleWalletPassResponse = {
  200: { jwt: string };
};

type RevocationListResponse = {
  200: { revoked: string[]; updatedAt: string };
};

export async function createBackendSignedCredential({
  client = getClient(),
  body,
}: {
  client?: Client;
  body: CreateBackendSignedCredentialInput;
}): Promise<{ data?: SignedCredential; error?: unknown }> {
  const result = await client.post<
    { 200: SignedCredential },
    unknown,
    false
  >({
    url: '/v1/nfc-badge/credentials',
    body: {
      user_id: body.userId,
      kind: body.kind,
      expires_in_seconds: body.expiresInSeconds,
    },
    headers: { 'Content-Type': 'application/json' },
  });
  return { data: result.data, error: result.error };
}

export async function createGoogleWalletPass({
  client = getClient(),
  body,
}: {
  client?: Client;
  body: { credential: SignedCredential; displayName: string };
}): Promise<{ data?: { jwt: string }; error?: unknown }> {
  const result = await client.post<GoogleWalletPassResponse, unknown, false>({
    url: '/v1/nfc-badge/wallet/google',
    body: {
      credential: body.credential,
      display_name: body.displayName,
    },
    headers: { 'Content-Type': 'application/json' },
  });
  return { data: result.data, error: result.error };
}

export async function updateGoogleWalletPass({
  client = getClient(),
  body,
}: {
  client?: Client;
  body: { credentialId: string; credential: SignedCredential };
}): Promise<{ data?: { jwt: string }; error?: unknown }> {
  const { credentialId, credential } = body;
  const result = await client.put<GoogleWalletPassResponse, unknown, false>({
    url: '/v1/nfc-badge/wallet/google/{credentialId}',
    path: { credentialId },
    body: { credential },
    headers: { 'Content-Type': 'application/json' },
  });
  return { data: result.data, error: result.error };
}

export async function getRevocationList({
  client = getClient(),
  since,
}: {
  client?: Client;
  since?: string;
}): Promise<{ data?: { revoked: string[]; updatedAt: string }; error?: unknown }> {
  const result = await client.get<RevocationListResponse, unknown, false>({
    url: '/v1/nfc-badge/revocations',
    query: { since },
  });
  return { data: result.data, error: result.error };
}

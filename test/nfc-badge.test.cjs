const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createBackendSignedCredential,
  createGoogleWalletPass,
  updateGoogleWalletPass,
  getRevocationList,
} = require('../dist');

function createMockClient() {
  const calls = [];
  return {
    calls,
    post: async (options) => {
      calls.push({ method: 'post', options });
      return { data: { jwt: 'test-jwt' } };
    },
    put: async (options) => {
      calls.push({ method: 'put', options });
      return { data: { jwt: 'test-jwt' } };
    },
    get: async (options) => {
      calls.push({ method: 'get', options });
      return { data: { revoked: ['cred-1'], updatedAt: '2024-01-01T00:00:00Z' } };
    },
  };
}

test('createBackendSignedCredential posts to /v1/nfc-badge/credentials', async () => {
  const client = createMockClient();
  const body = { userId: 'user-1', kind: 'resident', expiresInSeconds: 3600 };

  await createBackendSignedCredential({ client, body });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].method, 'post');
  assert.equal(client.calls[0].options.url, '/v1/nfc-badge/credentials');
  assert.deepEqual(client.calls[0].options.body, {
    user_id: 'user-1',
    kind: 'resident',
    expires_in_seconds: 3600,
  });
});

test('createGoogleWalletPass posts to /v1/nfc-badge/wallet/google', async () => {
  const client = createMockClient();
  const credential = { c: 'abc', e: 123, s: 'sig' };
  const body = { credential, displayName: 'Test User' };

  await createGoogleWalletPass({ client, body });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].method, 'post');
  assert.equal(client.calls[0].options.url, '/v1/nfc-badge/wallet/google');
  assert.deepEqual(client.calls[0].options.body, {
    credential,
    display_name: 'Test User',
  });
});

test('updateGoogleWalletPass puts to /v1/nfc-badge/wallet/google/{credentialId}', async () => {
  const client = createMockClient();
  const credential = { c: 'abc', e: 123, s: 'sig' };
  const body = { credentialId: 'cred-1', credential };

  await updateGoogleWalletPass({ client, body });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].method, 'put');
  assert.equal(client.calls[0].options.url, '/v1/nfc-badge/wallet/google/{credentialId}');
  assert.deepEqual(client.calls[0].options.path, { credentialId: 'cred-1' });
  assert.deepEqual(client.calls[0].options.body, { credential });
});

test('getRevocationList gets /v1/nfc-badge/revocations with since query', async () => {
  const client = createMockClient();

  await getRevocationList({ client, since: '2024-01-01T00:00:00Z' });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].method, 'get');
  assert.equal(client.calls[0].options.url, '/v1/nfc-badge/revocations');
  assert.deepEqual(client.calls[0].options.query, { since: '2024-01-01T00:00:00Z' });
});

test('getRevocationList omits query when since is undefined', async () => {
  const client = createMockClient();

  await getRevocationList({ client });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].method, 'get');
  assert.equal(client.calls[0].options.url, '/v1/nfc-badge/revocations');
  assert.deepEqual(client.calls[0].options.query, { since: undefined });
});

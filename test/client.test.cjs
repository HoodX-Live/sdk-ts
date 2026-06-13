const assert = require('node:assert/strict');
const test = require('node:test');

const { createHoodxClient, getAuthSession, postAuthLogin } = require('../dist');

function tokenStore(initialToken = null) {
  let token = initialToken;
  return {
    delete: async () => {
      token = null;
    },
    get: async () => token,
    set: async (nextToken) => {
      token = nextToken;
    },
  };
}

test('sends the stored session token and saves a replacement token', async () => {
  const store = tokenStore('old-token');
  const client = createHoodxClient({
    baseUrl: 'https://api.hoodx.test',
    sessionTokenStore: store,
  });

  client.setConfig({
    fetch: async (request) => {
      assert.equal(request.headers.get('X-Session-Token'), 'old-token');
      return Response.json({
        data: { methods: [], user: { email: 'resident@example.com', id: 1 } },
        meta: { is_authenticated: true, session_token: 'new-token' },
        status: 200,
      });
    },
  });

  const result = await postAuthLogin({
    body: {
      email: 'resident@example.com',
      password: 'correct-horse-battery-staple',
    },
    client,
  });

  assert.equal(result.response.status, 200);
  assert.equal(await store.get(), 'new-token');
});

test('saves pending signup or verification sessions returned with 401', async () => {
  const store = tokenStore();
  const client = createHoodxClient({
    baseUrl: 'https://api.hoodx.test',
    sessionTokenStore: store,
  });

  client.setConfig({
    fetch: async () =>
      Response.json(
        {
          data: { flows: [{ id: 'verify_email', is_pending: true }] },
          meta: { is_authenticated: false, session_token: 'pending-token' },
          status: 401,
        },
        { status: 401 },
      ),
  });

  await postAuthLogin({
    body: {
      email: 'resident@example.com',
      password: 'correct-horse-battery-staple',
    },
    client,
  });

  assert.equal(await store.get(), 'pending-token');
});

test('clears an invalid stored session', async () => {
  const store = tokenStore('expired-token');
  const client = createHoodxClient({
    baseUrl: 'https://api.hoodx.test',
    sessionTokenStore: store,
  });

  client.setConfig({
    fetch: async (request) => {
      assert.equal(request.url, 'https://api.hoodx.test/v1/auth/session');
      return Response.json(
        {
          data: { flows: [{ id: 'login' }] },
          meta: { is_authenticated: false },
          status: 410,
        },
        { status: 410 },
      );
    },
  });

  await getAuthSession({ client });

  assert.equal(await store.get(), null);
});

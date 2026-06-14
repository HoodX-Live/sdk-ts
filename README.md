# `@hoodx/sdk`

Generated TypeScript SDK for the HoodX API. It uses the Fetch API and works
with Expo and React Native.

## Install

```console
pnpm add @hoodx/sdk
```

## Expo authentication

Install `expo-secure-store` in the Expo app and adapt it to the SDK token store:

```ts
import * as SecureStore from "expo-secure-store";
import {
  createHoodxClient,
  postAuthLogin,
} from "@hoodx/sdk";

const TOKEN_KEY = "hoodx.session";
const client = createHoodxClient({
  baseUrl: process.env.EXPO_PUBLIC_HOODX_API_URL!,
  sessionTokenStore: {
    get: () => SecureStore.getItemAsync(TOKEN_KEY),
    set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
    delete: () => SecureStore.deleteItemAsync(TOKEN_KEY),
  },
});

const result = await postAuthLogin({
  client,
  body: { email, password },
});
```

The client sends `X-Session-Token` on authenticated requests, stores rotated
tokens, preserves pending authentication sessions, and clears invalid sessions.
Do not store session tokens in AsyncStorage.

## Development

`openapi.json` is exported from the HoodX backend and is the source of truth for
generated files under `src/generated/`.

```console
pnpm install
pnpm generate
pnpm check
```

Do not edit `src/generated/` manually.

## Release

The first release must be published by an npm organization owner because the
package does not exist yet:

```console
npm login
npm publish --access public --provenance=false
```

Local publishing cannot generate provenance because it does not run under a
supported cloud CI identity provider.

After the package exists, configure npm trusted publishing for:

- GitHub organization: `HoodX-Live`
- Repository: `sdk-ts`
- Workflow: `.github/workflows/publish.yml`
- Environment: `npm`

Subsequent releases use GitHub Actions:

1. Commit any SDK changes and ensure the working tree is clean.
2. Bump the package version. This updates `package.json`, creates a release
   commit, and tags it as `vX.Y.Z`:

```console
pnpm version patch
```

Use `minor`, `major`, or an explicit version instead of `patch` when
appropriate.

3. Push the release commit and tag:

```console
git push --follow-tags
```

The release workflow verifies the version, builds and tests the package, and
publishes it to npm with provenance.

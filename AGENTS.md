# AGENTS.md — `@hoodx/sdk`

This repository publishes the open-source TypeScript SDK for HoodX.

## Scope

- `openapi.json` is the source contract imported from the backend repo.
- `src/generated/` is generated code. Do not edit it by hand.
- `src/client.ts` and `src/index.ts` are the main hand-written integration
  layer.
- `test/` covers the session-token behavior that generation does not know
  about.

## Working rules

- Prefer the smallest possible diff.
- Treat generated files as build artifacts derived from `openapi.json`.
- If the API changes, update `openapi.json`, run generation, and commit the
  generated diff in the same change.
- Do not introduce backend logic into this repository. This package is a client
  wrapper, not a second source of product rules.

## Required commands

Run these before finishing:

```console
pnpm generate
pnpm build
pnpm test
pnpm check
```

`pnpm check` is the main gate. It regenerates the SDK, builds it, runs tests,
and fails if generation produces an uncommitted diff.

You can also use the unified `just` targets:

```console
just install
just build
just test
just check
just clean
```

## Editing guidance

- Hand edits usually belong in:
  - `src/client.ts`
  - `src/index.ts`
  - `README.md`
  - workflow files
  - tests
- Generated changes belong in:
  - `src/generated/`
- Avoid editing `dist/`. It is build output and is ignored by git.

## Authentication model

- The SDK uses allauth's `X-Session-Token`.
- The token store abstraction must stay storage-agnostic so Expo apps can use
  `expo-secure-store`.
- Preserve current behavior:
  - attach stored session tokens to requests
  - store rotated tokens from JSON responses
  - keep pending auth-session tokens from `401` responses
  - clear invalid session state on session logout or `410`

If you change this behavior, update tests first.

## Release model

- CI runs on pushes to `main`, pull requests, and version tags.
- Publishing is tag-driven through `.github/workflows/publish.yml`.
- The publish job depends on the CI check for the same tagged commit.
- Use `pnpm version <patch|minor|major>` to update `package.json`, create the
  release commit, and tag it as `vX.Y.Z`.
- Push the release commit and tag with `git push --follow-tags`.
- Local first publish uses:

```console
npm publish --access public --provenance=false
```

- Later publishes should go through GitHub Actions trusted publishing.

## Dependency policy

- Keep runtime dependencies minimal.
- Prefer platform APIs (`fetch`, `Headers`, `Request`, `Response`) over adding
  HTTP client libraries.
- New dependencies need a clear reason tied to SDK generation, packaging, or
  testability.

## When schema updates arrive

The normal flow is:

1. Backend exports a new `openapi.json`
2. This repo updates `openapi.json`
3. Run `pnpm generate`
4. Review generated diff plus any required wrapper/test changes
5. Run `pnpm check`

If generated output is surprising, investigate the schema change first instead
of patching generated files by hand.

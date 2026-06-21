set shell := ["bash", "-cu"]

# install: Install dependencies.
install:
    pnpm install

# dev: No dev server for the SDK.
dev:
    @echo "dev is not configured for the sdk-ts repo"

# build: Compile TypeScript.
build:
    pnpm build

# test: Run Node test runner.
test:
    pnpm test

# lint: No linter configured yet.
lint:
    @echo "lint is not configured for the sdk-ts repo"

# check: Full quality gate (regenerates, builds, tests, checks diff).
check:
    pnpm check

# clean: Remove build output.
clean:
    pnpm clean

# generate: Regenerate SDK from openapi.json.
generate:
    pnpm generate

# version: Bump version and create tag.
version ver:
    pnpm version {{ver}}

# publish-local: Local publish for testing.
publish-local:
    npm publish --access public --provenance=false

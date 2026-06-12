import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: {
    path: './openapi.json',
  },
  output: {
    clean: true,
    path: 'src/generated',
  },
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk'],
});

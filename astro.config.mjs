// @ts-check
import { defineConfig } from 'astro/config';

// Fully static: every page is rendered at build time from .data/projects.json
// (scripts/fetch-data.ts). English at /, German at /de/.
export default defineConfig({
  site: 'https://amigo-labs.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['typescript'],
  esbuildOptions(options) {
    options.banner = {
      js: '#!/usr/bin/env node'
    }
  }
});

import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  unbundle: true,
  clean: true,
  sourcemap: false,
  minify: false,
  dts: false,
  deps: {
    onlyBundle: false,
    alwaysBundle: ['@actions/core', '@scaleway/sdk-client', '@scaleway/sdk-container', '@scaleway/sdk-domain'],
  },
})

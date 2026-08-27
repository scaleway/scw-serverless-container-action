import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  outFilename: 'index.js',
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: false,
  minify: false,
  dts: false,
})

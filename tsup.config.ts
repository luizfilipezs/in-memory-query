import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  tsconfig: 'tsconfig.build.json',
});

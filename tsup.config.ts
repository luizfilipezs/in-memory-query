import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM build
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist/esm',
    dts: true,
    minify: true,
    treeshake: true,
    splitting: false,
    bundle: true,
    sourcemap: false,
    clean: true,
    target: 'es2020',
    keepNames: false,
    platform: 'neutral',
    tsconfig: 'tsconfig.build.json',
  },

  // CJS build
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cjs',
    dts: false, // avoid .d.ts duplicates
    minify: true,
    treeshake: true,
    splitting: false,
    bundle: true,
    sourcemap: false,
    target: 'es2020',
    keepNames: false,
    platform: 'neutral',
    tsconfig: 'tsconfig.build.json',
  },
]);

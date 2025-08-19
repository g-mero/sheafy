import strip from '@rollup/plugin-strip';
import { defineConfig } from 'tsdown';

// export both js and jsx
export default defineConfig([
  {
    entry: './src/index.ts',
    unbundle: true,
    platform: 'browser',
    format: ['esm'],
    clean: true,
    dts: true,
    plugins: [strip({ functions: ['console.*', 'debugger'] })],
    outputOptions: {
      chunkFileNames: 'chunks/[hash].js',
    },
    exports: true,
  },
]);

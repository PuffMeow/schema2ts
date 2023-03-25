import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import ts from '@rollup/plugin-typescript';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'schema2ts',
      fileName: 'src/index',
    },
  },
  plugins: [ts()],
  test: {},
});

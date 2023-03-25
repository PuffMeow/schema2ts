import { defineConfig } from 'vite';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'schema-ts',
      fileName: 'schema-ts',
    },
  },
  plugins: [typescript()],
});

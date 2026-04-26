import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/*.ts', { 'lib/*': ['src/lib/*.ts'] }],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
});

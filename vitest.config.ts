import { defineConfig } from 'tsdown';
import { configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, 'workspace/**'],
    },
});

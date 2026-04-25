import { configDefaults } from 'vitest/config'
import {defineConfig} from "tsdown";

export default defineConfig({
    test: {
        exclude: [
            ...configDefaults.exclude,
            'workspace/**'
        ],
    },
});

import defaultColors from 'tailwindcss/colors';
import { assert, describe, expect, test } from 'vitest';
import { createPlugin } from '../src/lib';
import { defaultConfig } from '../src/lib/v4';
import v4 from '../src/v4';

describe('module structure', () => {
    test('exports default export', () => {
        assert.isFunction(v4);
    });
});

describe('v4 plugin', () => {
    const config = { steps: 10 };
    const plugin = v4(config);

    test('matches createPlugin plugin signature', () => {
        const defaultPlugin = createPlugin(defaultConfig);
        expect(Object.keys(v4)).toStrictEqual(Object.keys(defaultPlugin));
        expect(Object.keys(plugin)).toStrictEqual(Object.keys(defaultPlugin(config)));
    });

    test('generates oklch colors', () => {
        const generated = plugin.config.theme.extend.colors({ colors: { blue: defaultColors.blue } });
        for (const color of Object.values(generated.blue)) {
            expect(color).match(/^oklch\((\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*)\)$/i);
        }
    });
});

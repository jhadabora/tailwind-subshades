import defaultColors from 'tailwindcss/colors';
import { assert, describe, expect, test } from 'vitest';
import { v3rgbLerp } from '../../src/lib/formula';
import * as libv3 from '../../src/lib/v3';

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(libv3, ['defaultConfig']);
    });
});

describe('v3 defaultConfig', () => {
    const config = libv3.defaultConfig(defaultColors);

    test('returns a config object', () => {
        assert.isFunction(libv3.defaultConfig);
        expect(config.default).toBe(defaultColors);
        expect(config.custom).toStrictEqual({});
        expect(config.ignore).toStrictEqual([]);
        expect(config.extraShades).toStrictEqual({ 0: defaultColors.white, 1000: defaultColors.black });
        expect(config.steps).toStrictEqual(50);
        expect(config.formula).toBe(v3rgbLerp);
    });
});

import defaultColors from 'tailwindcss/colors';
import { assert, describe, expect, test } from 'vitest';
import * as lib from '../../src/lib';
import { colorDarkBlue, colorMalachite, steps50 } from '../util';

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(lib, ['generateConfig', 'generateShades', 'createPlugin']);
    });
});

describe('generateShades', () => {
    test('returns specified shades for colors', () => {
        const colors: { [shade: number]: string } = {
            0: 'white',
            50: 'red',
            100: 'black',
        };
        const shades = lib.generateShades(
            colors,
            [25, 35, 85],
            (color1, color2, weight) => `${color1};${color2};${weight}`,
        );
        const components = Object.fromEntries(Object.entries(shades).map(([key, output]) => [key, output.split(';')]));
        const keys = Object.keys(components);
        expect(keys).toStrictEqual(['25', '35', '85']);
        expect(components[25][0]).toBe('white');
        expect(components[25][1]).toBe('red');
        expect(Number(components[25][2])).toBe(0.5);
    });

    test('returns shades for colors keyed by string', () => {
        const colors: { [shade: number]: string } = {
            '0': defaultColors.white,
            '500': '#0f0',
            1000: defaultColors.black,
        };
        const shades = lib.generateShades(colors, steps50, (color1, color2, weight) => `${color1};${color2};${weight}`);
        const components = Object.fromEntries(Object.entries(shades).map(([key, output]) => [key, output.split(';')]));
        expect(components[250][0]).toBe(defaultColors.white);
        expect(components[250][1]).toBe('#0f0');
        expect(Number(components[250][2])).toBe(0.5);
        expect(components[900][0]).toBe('#0f0');
        expect(components[900][1]).toBe(defaultColors.black);
        expect(Number(components[900][2])).toBe(0.8);
    });

    test('does not return shades out of color bounds', () => {
        const colors: { [shade: number]: string } = {
            0: 'white',
            100: 'red',
            200: 'black',
        };
        const shades = lib.generateShades(colors, steps50, (color1, color2, weight) => `${color1};${color2};${weight}`);
        expect(Object.keys(shades)).toStrictEqual(['50', '150']);
    });

    test('returns shades out of 0-1000', () => {
        const colors: { [shade: number]: string } = {
            '-250': 'white',
            '-150': 'red',
            '50': 'black',
        };
        const shades = lib.generateShades(
            colors,
            [-200, -50],
            (color1, color2, weight) => `${color1};${color2};${weight}`,
        );
        const components = Object.fromEntries(Object.entries(shades).map(([key, output]) => [key, output.split(';')]));
        const keys = Object.keys(components);
        expect(keys).toStrictEqual(['-200', '-50']);
        expect(components[-200][0]).toBe('white');
        expect(components[-200][1]).toBe('red');
        expect(Number(components[-200][2])).toBe(0.5);
        expect(components[-50][0]).toBe('red');
        expect(components[-50][1]).toBe('black');
        expect(Number(components[-50][2])).toBe(0.5);
    });

    test.for([
        ['#f00', 1],
        ['#ff0', 2],
        ['#ffff7f', 5],
    ] as [string, number][])('returns shades from custom formula function - %s -> %f', ([color, expected]) => {
        const colors: { [shade: number]: string } = {
            500: color,
            1000: defaultColors.black,
        };
        const shades = lib.generateShades(colors, steps50, (color1, _color2, _weight) =>
            String(color1.split('f').length - 1),
        );
        expect(Number(shades[750])).toBe(expected);
    });

    test('returns empty object for one color', () => {
        const colors: { [shade: number]: string } = {
            500: defaultColors.red[500],
        };
        const shades = lib.generateShades(colors, steps50, (_color1, _color2, _weight) => 'noop');
        expect(shades).toStrictEqual({});
    });

    test('returns empty object for no colors', () => {
        const colors: { [shade: number]: string } = {};
        const shades = lib.generateShades(colors, steps50, (_color1, _color2, _weight) => 'noop');
        expect(shades).toStrictEqual({});
    });
});

describe('generateConfig', () => {
    test('runs generateShades for each color', () => {
        const colors = {
            red: defaultColors.red,
            blue: { 400: defaultColors.blue[400], 600: defaultColors.blue[600] },
            malachite: colorMalachite,
        };
        const generated = lib.generateConfig(colors, steps50, {}, (_color1, _color2, _weight) => 'noop');

        for (const [name, shades] of Object.entries(colors)) {
            const actual = lib.generateShades(shades, steps50, (_color1, _color2, _weight) => 'noop');
            expect(Object.keys(generated[name]).length).toBeGreaterThan(0);
            expect(generated[name]).toStrictEqual(actual);
        }
    });

    test('skips non-object colors', () => {
        const colors = {
            malachite: colorMalachite,
            white: defaultColors.white,
            fn: (_props: { opacityVariable: string; opacityValue: string }) => 'noop',
        };
        const generated = lib.generateConfig(colors, steps50, {}, (_color1, _color2, _weight) => 'noop');

        expect(Object.keys(generated)).toStrictEqual(['malachite']);
        assert.isObject(generated.malachite);
    });

    test('applies extra shades', () => {
        const colors = { red: { 500: defaultColors.red[500] } };
        const none = lib.generateConfig(colors, steps50, {}, (_color1, _color2, _weight) => 'noop');
        const applied = lib.generateConfig(
            colors,
            steps50,
            {
                0: defaultColors.white,
                1000: defaultColors.black,
            },
            (_rgb) => 'noop',
        );

        expect(none.red).toStrictEqual({});
        expect(applied.red[250]).toBe('noop');
        expect(applied.red[750]).toBe('noop');
        assert.isUndefined(applied.red[0]);
        assert.isUndefined(applied.red[1000]);
    });

    test('returns empty object for no colors', () => {
        const colors = {};
        const generated = lib.generateConfig(colors, steps50, {}, (_color1, _color2, _weight) => 'noop');

        expect(generated).toStrictEqual({});
    });
});

describe('createPlugin', () => {
    test('matches Tailwind plugin signature', () => {
        const pluginFn = lib.createPlugin((_colors) => ({
            default: {},
            custom: {},
            ignore: [],
            steps: [],
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }));
        assert.isFunction(pluginFn);

        const plugin = pluginFn({});
        assert.isObject(plugin);

        assert.isFunction(plugin.handler);
        assert.isObject(plugin.config);
        assert.isFunction(plugin.config.theme.extend.colors);
    });

    test('passes Tailwind default colors to default config', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({});

        const generated = plugin.config.theme.extend.colors({ colors: { malachite: colorMalachite } });
        expect(generated).toStrictEqual(
            lib.generateConfig({ malachite: colorMalachite }, steps50, {}, (_color1, _color2, _weight) => 'noop'),
        );
    });

    test('replaces default options with user options', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({
            default: {},
            custom: { malachite: colorMalachite },
        });

        const generated = plugin.config.theme.extend.colors({ colors: defaultColors });
        expect(generated).toStrictEqual(
            lib.generateConfig({ malachite: colorMalachite }, steps50, {}, (_rgb) => 'noop'),
        );
    });

    test('drops default colors listed in ignore field', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({
            ignore: ['red', 'malachite'],
            custom: { malachite: colorMalachite },
        });

        const generated = plugin.config.theme.extend.colors({
            colors: { red: defaultColors.red, blue: defaultColors.blue },
        });
        expect(Object.keys(generated)).toStrictEqual(['blue', 'malachite']);
    });

    test('drops all default colors with ignore wildcard', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({
            ignore: '*',
            custom: { malachite: colorMalachite },
        });

        const generated = plugin.config.theme.extend.colors({
            colors: { red: defaultColors.red, blue: defaultColors.blue },
        });
        expect(Object.keys(generated)).toStrictEqual(['malachite']);
    });

    test('drops deprecated colors from default config', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({});

        const generated = Object.keys(plugin.config.theme.extend.colors({ colors: defaultColors }));
        for (const deprecatedColor of ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray']) {
            expect(generated).not.toContain(deprecatedColor);
        }
    });

    test('does not drop deprecated colors from user specified default config', () => {
        const plugin = lib.createPlugin((_colors) => ({
            default: {},
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (_color1, _color2, _weight) => 'noop',
        }))({
            default: {
                lightBlue: colorMalachite,
            },
        });

        const generated = plugin.config.theme.extend.colors({ colors: {} });
        expect(Object.keys(generated)).toStrictEqual(['lightBlue']);
    });

    test('allows passthrough of v4 color tokens', () => {
        const plugin = lib.createPlugin((colors) => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: { 0: 'white', 1000: 'black' },
            formula: (color1, color2, weight) => `${color1};${color2};${weight}`,
        }))({
            '--color-dark-blue-800': colorDarkBlue,
            '--not-a-color': colorDarkBlue,
        } as Record<`--color-${string}-${number}`, string>);

        const generated = plugin.config.theme.extend.colors({ colors: {} });
        expect(Object.keys(generated)).toStrictEqual(['dark-blue']);
        expect(generated['dark-blue'][800]).toBe(colorDarkBlue);
        const components900 = generated['dark-blue'][900].split(';');
        expect(components900[0]).toBe(colorDarkBlue);
        expect(components900[1]).toBe('black');
        expect(Number(components900[2])).toBe(0.5);
        const components950 = generated['dark-blue'][950].split(';');
        expect(components950[0]).toBe(colorDarkBlue);
        expect(components950[1]).toBe('black');
        expect(Number(components950[2])).toBe(0.75);
    });
});

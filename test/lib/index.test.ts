import {assert, describe, expect, test, vi} from "vitest";
import * as lib from "../../src/lib";
import defaultColors from "tailwindcss/colors"
import {colorDarkBlue, colorMalachite, steps50} from "../util";

describe('module structure', () => {
    test('exports named exports', () => {
        assert.hasAllKeys(lib, [
            'determineSteps',
            'generateConfig',
            'generateShades',
            'mergeColors',
            'createPlugin',
        ])
    })
})

describe('determineSteps', () => {
    test.for([100, 50, 25, 10, 1])('expands divisble %i to an array of numbers', (value) => {
        const range = lib.determineSteps(value)
        expect(range[0]).toBe(value)
        expect(range[range.length - 1]).toBe(1000 - value)
        expect(range).toStrictEqual([...Array((1000/value)-1).keys()].map(n => (n+1) * value))
    })

    test.for([33, 66, 97, 92, 11, 17])('expands non-divisble %i within 0-1000', (value) => {
        const range = lib.determineSteps(value)
        expect(range[0]).toBe(value)
        expect(range[range.length - 1]).toBeLessThan(1000)
        expect(range).toStrictEqual([...Array(Math.ceil(1000/value)-1).keys()].map(n => (n+1) * value))
    })

    test.for([1001, 1000, 0, -1, -1001])('returns empty array for invalid %i', (value) => {
        expect(lib.determineSteps(value)).toStrictEqual([])
    })

    test.for([steps50, [500], [0, 1000], [-10, 1010], []])('returns array in place', (values) => {
        expect(lib.determineSteps(values)).toStrictEqual(values)
    })
})

describe('generateShades', () => {
    test('returns linear shades for a given color', () => {
        const colors: { [shade: number]: string } = {
            0: defaultColors.white,
            500: '#f00',
            1000: defaultColors.black
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        expect(components[250][0]).toBeCloseTo(1.0)
        expect(components[250][1]).toBeCloseTo(0.5)
        expect(components[250][2]).toBeCloseTo(0.5)
        expect(components[750][0]).toBeCloseTo(0.5)
        expect(components[750][1]).toBeCloseTo(0.0)
        expect(components[750][2]).toBeCloseTo(0.0)
        expect(components[50][0]).toBeCloseTo(1.0)
        expect(components[50][1]).toBeCloseTo(0.9)
        expect(components[50][2]).toBeCloseTo(0.9)
        expect(components[950][0]).toBeCloseTo(0.1)
        expect(components[950][1]).toBeCloseTo(0.0)
        expect(components[950][2]).toBeCloseTo(0.0)
    })

    test('returns shades for colors keyed by string', () => {
        const colors: { [shade: number]: string } = {
            '0': defaultColors.white,
            '500': '#0f0',
            1000: defaultColors.black
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        expect(components[250][0]).toBeCloseTo(0.5)
        expect(components[250][1]).toBeCloseTo(1.0)
        expect(components[250][2]).toBeCloseTo(0.5)
        expect(components[750][0]).toBeCloseTo(0.0)
        expect(components[750][1]).toBeCloseTo(0.5)
        expect(components[750][2]).toBeCloseTo(0.0)
    })

    test('returns shades for given colors in other formats', () => {
        const colors: { [shade: number]: string } = {
            0: '#ffffff',
            100: '#f00',
            200: 'rgb(255, 255, 0)',
            300: 'oklch(0.8664 0.294827 142.4953)',
            400: 'hsl(180, 100%, 50%)',
            500: 'blue',
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        expect(components[50][0]).toBeCloseTo(1.0)
        expect(components[50][1]).toBeCloseTo(0.5)
        expect(components[50][2]).toBeCloseTo(0.5)
        expect(components[150][0]).toBeCloseTo(1.0)
        expect(components[150][1]).toBeCloseTo(0.5)
        expect(components[150][2]).toBeCloseTo(0.0)
        expect(components[250][0]).toBeCloseTo(0.5)
        expect(components[250][1]).toBeCloseTo(1.0)
        expect(components[250][2]).toBeCloseTo(0.0)
        expect(components[350][0]).toBeCloseTo(0.0)
        expect(components[350][1]).toBeCloseTo(1.0)
        expect(components[350][2]).toBeCloseTo(0.5)
        expect(components[450][0]).toBeCloseTo(0.0)
        expect(components[450][1]).toBeCloseTo(0.5)
        expect(components[450][2]).toBeCloseTo(1.0)
    })

    test('returns shades for colors out of rgb bounds', () => {
        const colors: { [shade: number]: string } = {
            '0': defaultColors.white,
            '400': 'oklch(0.8716 0.47 140)',
            '600': 'oklch(0.6245 0.2152 250)',
            1000: defaultColors.black
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        assert.isNotNaN(components[500][0])
        assert.isNotNaN(components[500][1])
        assert.isNotNaN(components[500][2])
    })

    test('returns specified shades for colors', () => {
        const colors: { [shade: number]: string } = {
            0: 'white',
            50: 'red',
            100: 'black'
        }
        const rgb = lib.generateShades(colors, [25], rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        const keys = Object.keys(components)
        expect(keys).toStrictEqual(['25'])
        expect(components[25][0]).toBeCloseTo(1.0)
        expect(components[25][1]).toBeCloseTo(0.5)
        expect(components[25][2]).toBeCloseTo(0.5)
    })

    test('does not return shades out of color bounds', () => {
        const colors: { [shade: number]: string } = {
            0: 'white',
            100: 'red',
            200: 'black'
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        const keys = Object.keys(components)
        expect(keys).toStrictEqual(['50', '150'])
    })

    test('returns shades out of 0-1000', () => {
        const colors: { [shade: number]: string } = {
            "-250": 'white',
            "-150": 'red',
            "50": 'black'
        }
        const rgb = lib.generateShades(colors, [-200, -50], rgb => `${rgb.r};${rgb.g};${rgb.b}`)
        const components = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';').map(Number)]))
        const keys = Object.keys(components)
        expect(keys).toStrictEqual(['-200', '-50'])
        expect(components[-200][0]).toBeCloseTo(1.0)
        expect(components[-200][1]).toBeCloseTo(0.5)
        expect(components[-200][2]).toBeCloseTo(0.5)
        expect(components[-50][0]).toBeCloseTo(0.5)
        expect(components[-50][1]).toBeCloseTo(0.0)
        expect(components[-50][2]).toBeCloseTo(0.0)
    })

    test.for([
        ['#f00', 0.5],
        ['#ff0', 1.0],
        ['#ffff7f', 1.25],
        ['white', 1.5],
    ] as [string, number][])('returns shades in output function format - %s -> %f', ([color, sum]) => {
        const colors: { [shade: number]: string } = {
            500: color,
            1000: defaultColors.black
        }
        const rgb = lib.generateShades(colors, steps50, rgb => `test color ${rgb.mode};${rgb.r+rgb.g+rgb.b}`)
        const parts = Object.fromEntries(Object.entries(rgb).map(([key, rgb]) => [key, rgb.split(';')]))
        expect(parts[750][0]).toBe('test color rgb')
        expect(parts[750][1]).toBeCloseTo(sum)
    })

    test('returns empty object for one color', () => {
        const colors: { [shade: number]: string } = {
            500: defaultColors.red[500],
        }
        const rgb = lib.generateShades(colors, steps50, rgb => 'noop')
        expect(rgb).toStrictEqual({})
    })

    test('returns empty object for no colors', () => {
        const colors: { [shade: number]: string } = {}
        const rgb = lib.generateShades(colors, steps50, rgb => 'noop')
        expect(rgb).toStrictEqual({})
    })
})

describe('generateConfig', () => {
    test('runs generateShades for each color', () => {
        const colors = {red: defaultColors.red, blue: {400: defaultColors.blue[400], 600: defaultColors.blue[600]}, malachite: colorMalachite}
        const generated = lib.generateConfig(colors, steps50, {}, rgb => 'noop')

        for (const [name, shades] of Object.entries(colors)) {
            const actual = lib.generateShades(shades, steps50, rgb => 'noop')
            expect(Object.keys(generated[name]).length).toBeGreaterThan(0)
            expect(generated[name]).toStrictEqual(actual)
        }
    })

    test('skips non-object colors', () => {
        const colors = {malachite: colorMalachite, white: defaultColors.white, fn: (props: { opacityVariable: string, opacityValue: string }) => 'noop'}
        const generated = lib.generateConfig(colors, steps50, {}, rgb => 'noop')

        expect(Object.keys(generated)).toStrictEqual(['malachite'])
        assert.isObject(generated.malachite)
    })

    test('applies extra shades', () => {
        const colors = {red: {500: defaultColors.red[500]}}
        const none = lib.generateConfig(colors, steps50, {}, rgb => 'noop')
        const applied = lib.generateConfig(colors, steps50, {
            0: defaultColors.white,
            1000: defaultColors.black,
        }, rgb => 'noop')

        expect(none.red).toStrictEqual({})
        expect(applied.red[250]).toBe('noop')
        expect(applied.red[750]).toBe('noop')
        assert.isUndefined(applied.red[0])
        assert.isUndefined(applied.red[1000])
    })

    test('returns empty object for no colors', () => {
        const colors = {}
        const generated = lib.generateConfig(colors, steps50, {}, rgb => 'noop')

        expect(generated).toStrictEqual({})
    })
});

describe('mergeColors', () => {
    test('merges two objects of different colors', () => {
        const merged = lib.mergeColors({
            red: defaultColors.red,
            green: defaultColors.green,
        }, {
            blue: defaultColors.blue,
        }, {
            pink: defaultColors.pink,
        })
        expect(merged).toStrictEqual({
            red: defaultColors.red,
            green: defaultColors.green,
            blue: defaultColors.blue,
            pink: defaultColors.pink,
        })
    })

    test('merges shades of the same color', () => {
        const merged = lib.mergeColors({red: {
            100: defaultColors.red[100],
            300: defaultColors.red[300],
        }}, {red: {
            200: defaultColors.red[200],
        }}, {red: {
            400: defaultColors.red[400],
        }})
        expect(merged).toStrictEqual({red: {
            100: defaultColors.red[100],
            200: defaultColors.red[200],
            300: defaultColors.red[300],
            400: defaultColors.red[400],
        }})
    })

    test('later items take precedence', () => {
        const merged = lib.mergeColors({
            red: defaultColors.orange,
            malachite: {400: colorMalachite[400], 500: colorMalachite[600]},
        }, {
            red: defaultColors.red,
            malachite: {500: colorMalachite[500]},
        })
        expect(merged).toStrictEqual({
            red: defaultColors.red,
            malachite: {400: colorMalachite[400], 500: colorMalachite[500]},
        })
    })

    test('later non-shaded items replace', () => {
        const malachiteFn = (props: object) => colorMalachite[500]
        const merged = lib.mergeColors({
            black: defaultColors.red,
            malachite: {400: colorMalachite[400], 500: colorMalachite[500]},
        }, {
            black: defaultColors.black,
            malachite: malachiteFn,
        })
        expect(merged).toStrictEqual({
            black: defaultColors.black,
            malachite: malachiteFn,
        })
    })

    test('earlier non-shaded items are replaced', () => {
        const malachiteFn = (props: object) => colorMalachite[500]
        const merged = lib.mergeColors({
            black: defaultColors.black,
            malachite: malachiteFn,
        }, {
            black: defaultColors.red,
            malachite: {400: colorMalachite[400], 500: colorMalachite[500]},
        })
        expect(merged).toStrictEqual({
            black: defaultColors.red,
            malachite: {400: colorMalachite[400], 500: colorMalachite[500]},
        })
    })
})

describe('createPlugin', () => {
    test('matches Tailwind plugin signature', () => {
        const pluginFn = lib.createPlugin(colors => ({
            default: {},
            custom: {},
            ignore: [],
            steps: [],
            extraShades: {},
            output: rgb => 'noop',
        }))
        assert.isFunction(pluginFn)

        const options = { steps: 50 }
        const plugin = pluginFn(options)
        assert.isObject(plugin)

        expect(plugin.__options).toBe(options)
        assert.isFunction(plugin.handler)
        assert.isObject(plugin.config)
        assert.isFunction(plugin.config.theme.extend.colors)
    })

    test('passes Tailwind default colors to default config', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({})

        const generated = plugin.config.theme.extend.colors({colors: {malachite: colorMalachite}})
        expect(generated).toStrictEqual(lib.generateConfig({malachite: colorMalachite}, steps50, {}, rgb => 'noop'))
    })

    test('replaces default options with user options', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({
            default: {},
            custom: {malachite: colorMalachite},
        })

        const generated = plugin.config.theme.extend.colors({colors: defaultColors})
        expect(generated).toStrictEqual(lib.generateConfig({malachite: colorMalachite}, steps50, {}, rgb => 'noop'))
    })

    test('drops default colors listed in ignore field', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({
            ignore: ['red', 'malachite'],
            custom: {malachite: colorMalachite},
        })

        const generated = plugin.config.theme.extend.colors({colors: {red: defaultColors.red, blue: defaultColors.blue}})
        expect(Object.keys(generated)).toStrictEqual(['blue', 'malachite'])
    })

    test('drops all default colors with ignore wildcard', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({
            ignore: '*',
            custom: {malachite: colorMalachite},
        })

        const generated = plugin.config.theme.extend.colors({colors: {red: defaultColors.red, blue: defaultColors.blue}})
        expect(Object.keys(generated)).toStrictEqual(['malachite'])
    })

    test('drops deprecated colors from default config', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({})

        const generated = Object.keys(plugin.config.theme.extend.colors({colors: defaultColors}))
        for (const deprecatedColor of ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray']) {
            expect(generated).not.toContain(deprecatedColor)
        }
    })

    test('does not drop deprecated colors from user specified default config', () => {
        const plugin = lib.createPlugin(colors => ({
            default: {},
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            output: rgb => 'noop',
        }))({
            default: {
                lightBlue: colorMalachite,
            },
        })

        const generated = plugin.config.theme.extend.colors({colors: {}})
        expect(Object.keys(generated)).toStrictEqual(['lightBlue'])
    })

    test('allows passthrough of v4 color tokens', () => {
        const plugin = lib.createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {0: 'white', 1000: 'black'},
            output: rgb => `${rgb.r};${rgb.g};${rgb.b}`,
        }))({
            '--color-dark-blue-800': colorDarkBlue,
            '--not-a-color': colorDarkBlue
        } as Record<`--color-${string}-${number}`, string>)

        const generated = plugin.config.theme.extend.colors({colors: {}})
        expect(Object.keys(generated)).toStrictEqual(['dark-blue'])
        expect(generated['dark-blue'][800]).toBe(colorDarkBlue)
        const components900 = generated['dark-blue'][900].split(';').map(Number)
        const components950 = generated['dark-blue'][950].split(';').map(Number)
        expect(components950[2]).toBeGreaterThan(0)
        expect(components950[2]).toBeLessThan(components900[2])
    })
})
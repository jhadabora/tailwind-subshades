import {beforeAll, describe, expect, test, vi} from "vitest";
import defaultColors from "tailwindcss/colors";
import {createPlugin} from "../../src/lib";

let formula: Awaited<typeof import('../../src/lib/formula')>

beforeAll(async () => {
    vi.resetModules()
    process.env.TAILWIND_SUBSHADES_TEST_DISABLE_CULORI = 'true'
    formula = await import('../../src/lib/formula')
    delete process.env.TAILWIND_SUBSHADES_TEST_DISABLE_CULORI
})

describe('throws with missing Culori', () => {
    test('parseCuloriRgb', async () => {
        expect(() => formula.parseCuloriRgb('#ff0000')).toThrow('culori is not available')
    });

    test('outputCuloriHex', async () => {
        expect(() => formula.outputCuloriHex({mode: 'rgb', r: 1.0, g: 0.0, b: 0.0})).toThrow('culori is not available')
    });

    test('outputCuloriOklch', async () => {
        expect(() => formula.outputCuloriOklch({mode: 'rgb', r: 1.0, g: 0.0, b: 0.0})).toThrow('culori is not available')
    });

    test('v3rgbLerp', async () => {
        expect(() => formula.v3rgbLerp('#ff0000', '#00ff00', 0.5)).toThrow('culori is not available')
    });

    test('v4rgbLerp', async () => {
        expect(() => formula.v4rgbLerp('#ff0000', '#00ff00', 0.5)).toThrow('culori is not available')
    });
});

describe('works with missing Culori', () => {
    test('plugin', () => {
        const plugin = createPlugin(colors => ({
            default: colors,
            custom: {},
            ignore: [],
            steps: 50,
            extraShades: {},
            formula: (color1, color2, weight) => 'noop',
        }))
        const shades = plugin({}).config.theme.extend.colors({colors: {red: defaultColors.red}})
        expect(Object.values(shades.red)).toContain('noop')
    })
})
